"use client";

import React, { useState, useEffect, useCallback } from "react";
import Badge from "@/components/ui/badge/Badge";
import { getHistory, getUsersInfo } from "@/services/api/historys";

// CSS for animation delays
const animationStyles = `
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
.animate-pulse-delay-200 {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 200ms;
}
.animate-pulse-delay-400 {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  animation-delay: 400ms;
}
`;

// API response interfaces
interface HistoryItem {
  id: number;
  user: number;
  time?: string;
  login_time?: string;
  server_time: string;
  confidence: number;
  device_info: Record<string, unknown>;
  location: string | null;
  status: "SUCCESS" | "FAILED" | "UNKNOWN";
  face_embedding: number | null;
  timezone: string;
}

interface UserInfo {
  id: number;
  name: string;
  username?: string;
  email?: string;
}

interface HistoryResponseData {
  current_page: number;
  per_page: number;
  total: number;
  items: HistoryItem[];
}

interface HistoryResponse {
  success: boolean;
  message: string;
  data: HistoryResponseData | HistoryItem[];
  items?: HistoryItem[]; // For alternative API response format
}

interface VerificationHistory {
  id: string;
  time: string;
  status: "success" | "failed" | "unknown";
  confidence: number;
  device: string;
  location: string;
  timezone: string;
  user: number;
  userName?: string;
}

interface SortConfig {
  key: keyof VerificationHistory;
  direction: "asc" | "desc";
}

interface HistoryProps {
  filterParams?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    deviceId?: string;
  };
}

export default function History({ filterParams }: HistoryProps) {
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [apiData, setApiData] = useState<HistoryResponse | null>(null);
  const [tableData, setTableData] = useState<VerificationHistory[]>([]);
  const [userInfoMap, setUserInfoMap] = useState<Record<number, UserInfo>>({});

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Sorting state
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "time",
    direction: "desc",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Fetch data from API
  const fetchHistoryData = useCallback(async (
    page: number = 1, 
    search: string = searchTerm,
    sortKey: string = sortConfig.key,
    sortDirection: string = sortConfig.direction,
    loadAllForSearch: boolean = false
  ) => {
    try {
      setLoading(true);
      
      // Map frontend field names to backend field names
      const backendFieldMap: Record<string, string> = {};
      
      // Use the mapped backend field name if it exists, otherwise use the original
      const backendSortKey = backendFieldMap[sortKey] || sortKey;
      
      const params = {
        current_page: page.toString(),
        per_page: loadAllForSearch ? "100" : itemsPerPage.toString(),
        all: loadAllForSearch ? "true" : "false",
        // Chỉ gửi tham số search khi không phải tìm kiếm theo tên người dùng
        ...(search && !loadAllForSearch ? { search } : {}),
        // Chỉ gửi search_by khi không phải tìm kiếm theo tên người dùng
        ...(search && !loadAllForSearch ? { search_by: 'user_name' } : {}),
        sort_by: backendSortKey,
        sort_direction: sortDirection,
        // Add filter parameters if provided
        ...(filterParams?.startDate && { start_date: filterParams.startDate }),
        ...(filterParams?.endDate && { end_date: filterParams.endDate }),
        ...(filterParams?.status && { status: filterParams.status }),
        ...(filterParams?.deviceId && { device_id: filterParams.deviceId }),
      };
      
      console.log("Fetching history with params:", params);
      const response = await getHistory(params);
      console.log("API Response:", response);
      
      setApiData(response);
      
      // Check if response has the expected structure
      if (response.success && response.data) {
        if (typeof response.data === 'object' && !Array.isArray(response.data) && 'total' in response.data) {
          // Standard structure with data.total
          setTotalItems(response.data.total);
          setCurrentPage(parseInt(response.data.current_page?.toString() || page.toString()));
          
          // Debug pagination
          console.log("Pagination debug:", {
            currentPage: response.data.current_page,
            totalItems: response.data.total,
            totalPages: Math.ceil(response.data.total / (response.data.per_page || itemsPerPage)),
            itemsReceived: response.data.items?.length || 0
          });
          
        } else if (Array.isArray(response.data)) {
          // Array structure
          setTotalItems(response.data.length);
          setCurrentPage(page);
          
          // Debug pagination
          console.log("Pagination debug (array):", {
            currentPage: page,
            totalItems: response.data.length,
            itemsReceived: response.data.length
          });
        }
      } else if (response.success && response.items && Array.isArray(response.items)) {
        // Handle response with items at root level
        setTotalItems(response.items.length);
        setCurrentPage(page);
        
        // Debug pagination
        console.log("Pagination debug (root items):", {
          currentPage: page,
          totalItems: response.items.length,
          itemsReceived: response.items.length
        });
      } else {
        console.error("API response doesn't have expected structure:", response);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching history data:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, sortConfig, filterParams, itemsPerPage]);

  // Extract history items from API response
  const extractHistoryItems = useCallback((apiData: HistoryResponse): HistoryItem[] => {
    if (!apiData) return [];
    
    let items: HistoryItem[] = [];
    
    if (apiData.data && typeof apiData.data === 'object' && !Array.isArray(apiData.data) && 'items' in apiData.data) {
      // Expected structure with data.items
      items = apiData.data.items;
    } else if (Array.isArray(apiData.data)) {
      // Alternative structure with data as array
      items = apiData.data;
    } else if (apiData.items && Array.isArray(apiData.items)) {
      // Another possible structure with items at root level
      items = apiData.items;
    }
    
    return items;
  }, []);

  // Fetch user information
  const fetchUserInfo = useCallback(async (items: HistoryItem[]) => {
    try {
      setLoadingUsers(true);
      
      // Extract unique user IDs
      const userIds = [...new Set(items.map(item => item.user))];
      
      // Skip if no users or all users are already loaded
      if (userIds.length === 0 || userIds.every(id => id in userInfoMap)) {
        return;
      }
      
      // Filter out user IDs we already have
      const idsToFetch = userIds.filter(id => !(id in userInfoMap));
      
      if (idsToFetch.length === 0) {
        return;
      }
      
      console.log("Fetching user info for IDs:", idsToFetch);
      const response = await getUsersInfo(idsToFetch);
      
      if (response.success && response.data) {
        // Create map of user ID to user info
        const newUserInfoMap = { ...userInfoMap };
        
        response.data.forEach((user: UserInfo) => {
          newUserInfoMap[user.id] = user;
        });
        
        setUserInfoMap(newUserInfoMap);
      }
    } catch (error) {
      console.error("Error fetching user information:", error);
    } finally {
      setLoadingUsers(false);
    }
  }, [userInfoMap]);

  // Initial data fetch
  useEffect(() => {
    fetchHistoryData();
  }, [fetchHistoryData]);

  // Refetch when filter parameters change
  useEffect(() => {
    if (filterParams) {
      fetchHistoryData(1); // Reset to first page when filters change
    }
  }, [filterParams, fetchHistoryData]);

  // Extract history items and fetch user info when API data changes
  useEffect(() => {
    if (apiData) {
      const historyItems = extractHistoryItems(apiData);
      console.log("Extracted history items:", historyItems.length, "items");
      fetchUserInfo(historyItems);
      
      try {
        const mappedData: VerificationHistory[] = historyItems.map(item => {
          // Safely extract values with fallbacks
          const id = item.id?.toString() || "unknown";
          const time = item.time || item.login_time || item.server_time || new Date().toISOString();
          const status = (item.status || "UNKNOWN").toLowerCase() as "success" | "failed" | "unknown";
          const confidence = typeof item.confidence === 'number' ? Math.max(0, item.confidence * 100) : 0;
          const deviceInfo = item.device_info || {};
          const location = item.location || "Unknown";
          const timezone = item.timezone || "UTC";
          const user = item.user || 0;
          
          return {
            id,
            time: new Date(time).toLocaleString(),
            status,
            confidence,
            device: getDeviceInfo(deviceInfo),
            location,
            timezone,
            user
          };
        });
        
        setTableData(mappedData);
        console.log("Mapped data for UI:", mappedData.length, "items");
      } catch (error) {
        console.error("Error mapping API data:", error);
        setTableData([]);
      }
    }
  }, [apiData, extractHistoryItems, fetchUserInfo]);

  // Extract device information
  const getDeviceInfo = (deviceInfo: Record<string, unknown> | undefined): string => {
    if (!deviceInfo || Object.keys(deviceInfo).length === 0) {
      return "Unknown Device";
    }
    
    // Try to extract useful device info
    const model = deviceInfo.model as string || deviceInfo.deviceModel as string;
    const brand = deviceInfo.brand as string || deviceInfo.deviceBrand as string;
    const name = deviceInfo.name as string || deviceInfo.deviceName as string;
    
    if (model && brand) {
      return `${brand} ${model}`;
    } else if (name) {
      return name;
    } else if (model) {
      return model;
    } else if (brand) {
      return brand;
    }
    
    return "Unknown Device";
  };

  // Get user name from user info map
  const getUserName = (userId: number): string => {
    const userInfo = userInfoMap[userId];
    if (userInfo) {
      return userInfo.name || userInfo.username || `User ${userId}`;
    }
    return `User ${userId}`;
  };

  // Filter data based on search term
  const filteredData = tableData.filter(item => {
    if (!searchTerm) return true;
    
    // Lọc theo tên người dùng (client-side filtering)
    const userName = getUserName(item.user).toLowerCase();
    return userName.includes(searchTerm.toLowerCase());
  });

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Khi người dùng nhập tìm kiếm, tải nhiều dữ liệu hơn để tìm kiếm phía client
    if (value.trim() !== '') {
      fetchHistoryData(1, '', sortConfig.key, sortConfig.direction, true);
    } else {
      // Khi xóa tìm kiếm, tải lại dữ liệu bình thường
      fetchHistoryData(1);
    }
  };

  // Get current items for display
  const currentItems = searchTerm 
    ? filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : tableData; // Use tableData directly when not searching, as it already contains the current page data from API
  
  const totalFilteredItems = filteredData.length;
  const totalPages = searchTerm
    ? Math.max(1, Math.ceil(totalFilteredItems / itemsPerPage))
    : Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Pagination for client-side filtering
  const handleClientPagination = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Change page
  const paginate = (pageNumber: number) => {
    if (searchTerm) {
      // Khi đang tìm kiếm theo tên, sử dụng phân trang phía client
      handleClientPagination(pageNumber);
    } else {
      // Khi không tìm kiếm, sử dụng phân trang từ API
      setCurrentPage(pageNumber);
      fetchHistoryData(pageNumber);
    }
  };
  
  const goToNextPage = () => {
    const nextPage = Math.min(currentPage + 1, totalPages);
    paginate(nextPage);
  };
  
  const goToPrevPage = () => {
    const prevPage = Math.max(currentPage - 1, 1);
    paginate(prevPage);
  };

  // Handle sort
  const handleSort = (key: keyof VerificationHistory) => {
    const direction = 
      sortConfig.key === key && sortConfig.direction === "asc"
        ? "desc"
        : "asc";
    
    setSortConfig({
      key,
      direction,
    });
    
    // Fetch data with new sort parameters
    fetchHistoryData(currentPage, searchTerm, key, direction);
  };

  // Render sort indicator
  const renderSortIndicator = (key: keyof VerificationHistory) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ▲" : " ▼";
  };

  // Determine color of confidence bar
  const getConfidenceBarColor = (value: number) => {
    if (value >= 70) return "bg-green-500";
    if (value >= 40) return "bg-yellow-400";
    return "bg-red-500";
  };

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Add animation styles */}
      <style>{animationStyles}</style>

      {/* Search Bar */}
      <div className="w-full p-4 sm:p-6 border-b border-gray-200 dark:border-white/[0.05]">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by user name..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-4 pr-4 py-2 border border-gray-200 dark:border-white/[0.05] rounded-lg bg-white dark:bg-white/[0.03] text-gray-800 dark:text-white/90 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        {loading ? (
          <div className="text-center py-10">
            <div className="text-gray-600 dark:text-gray-400">
              <div className="animate-pulse flex justify-center">
                <div className="h-4 w-4 bg-gray-400 dark:bg-gray-600 rounded-full mr-1"></div>
                <div className="h-4 w-4 bg-gray-400 dark:bg-gray-600 rounded-full mr-1 animate-pulse-delay-200"></div>
                <div className="h-4 w-4 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse-delay-400"></div>
              </div>
              <div className="mt-2">Loading history data...</div>
            </div>
          </div>
        ) : tableData.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-gray-600 dark:text-gray-400">No history data found</div>
          </div>
        ) : (
        <table className="w-full">
          {/* Table Header */}
          <thead className="border-b border-gray-100 dark:border-white/[0.05]">
            <tr>
              <th
                className="relative whitespace-nowrap px-6 py-4 font-medium text-gray-600 dark:text-gray-300 text-start cursor-pointer select-none"
                onClick={() => handleSort("time")}
              >
                <div className="flex items-center">
                  <span className="uppercase tracking-wide">TIME</span>
                  <span className="ml-1">
                    {renderSortIndicator("time")}
                  </span>
                </div>
              </th>
              <th
                className="relative whitespace-nowrap px-6 py-4 font-medium text-gray-600 dark:text-gray-300 text-start cursor-pointer select-none"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center">
                  <span className="uppercase tracking-wide">STATUS</span>
                  <span className="ml-1">
                    {renderSortIndicator("status")}
                  </span>
                </div>
              </th>
              <th
                className="relative whitespace-nowrap px-6 py-4 font-medium text-gray-600 dark:text-gray-300 text-start cursor-pointer select-none"
                onClick={() => handleSort("confidence")}
              >
                <div className="flex items-center">
                  <span className="uppercase tracking-wide">CONFIDENCE</span>
                  <span className="ml-1">
                    {renderSortIndicator("confidence")}
                  </span>
                </div>
              </th>
              <th
                className="relative whitespace-nowrap px-6 py-4 font-medium text-gray-600 dark:text-gray-300 text-start cursor-pointer select-none"
                onClick={() => handleSort("device")}
              >
                <div className="flex items-center">
                  <span className="uppercase tracking-wide">DEVICE</span>
                  <span className="ml-1">
                    {renderSortIndicator("device")}
                  </span>
                </div>
              </th>
              <th
                className="relative whitespace-nowrap px-6 py-4 font-medium text-gray-600 dark:text-gray-300 text-start cursor-pointer select-none"
                onClick={() => handleSort("user")}
              >
                <div className="flex items-center">
                  <span className="uppercase tracking-wide">USER</span>
                  <span className="ml-1">
                    {renderSortIndicator("user")}
                  </span>
                </div>
              </th>
              <th
                className="relative whitespace-nowrap px-6 py-4 font-medium text-gray-600 text-start text-theme-sm dark:text-gray-300"
              >
                LOCATION
              </th>
              <th
                className="relative whitespace-nowrap px-6 py-4 font-medium text-gray-600 text-start text-theme-sm dark:text-gray-300"
              >
                TIMEZONE
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {currentItems.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {item.time}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-start">
                  <Badge color={
                    item.status === "success" ? "success" : 
                    item.status === "failed" ? "error" : 
                    "warning"
                  }>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="relative w-24 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className={`h-1.5 rounded-full ${getConfidenceBarColor(item.confidence)}`}
                        style={{ width: `${item.confidence}%` }}
                      />
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {item.confidence.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex items-center gap-2">
                  <span className="truncate max-w-[150px]" title={item.device}>{item.device}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {loadingUsers ? (
                    <div className="animate-pulse h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ) : (
                    getUserName(item.user)
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {item.location}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {item.timezone}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>

      {/* Pagination */}
      <div className="w-full flex items-center justify-between px-4 py-3 sm:px-6 border-t border-gray-200 dark:border-white/[0.05]">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-lg border border-gray-200 dark:border-white/[0.05] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          <span className="text-gray-600 dark:text-gray-400 min-w-[100px] text-center">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-lg border border-gray-200 dark:border-white/[0.05] text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          Total: {searchTerm ? totalFilteredItems : totalItems || 0} records
          {searchTerm && (
            <span className="ml-2 text-blue-500">
              (Filtered by name: &ldquo;{searchTerm}&rdquo;)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}