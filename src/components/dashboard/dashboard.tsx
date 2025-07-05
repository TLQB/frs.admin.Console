"use client"

import { Metadata } from "next";
import React, { useState, useEffect, useCallback } from "react";
import Metrics from "./metrics";
import Filter from "./filter";
import Charts from "./charts";
import History from "./history";
import { getHistory } from "@/services/api/historys";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "Next.js Blank Page | TailAdmin - Next.js Dashboard Template",
  description: "This is Next.js Blank Page TailAdmin Dashboard Template",
};

interface DeviceOption {
  value: string;
  label: string;
}

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

export default function Dashboard() {
  // Date range - default to last 30 days
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [status, setStatus] = useState('all');
  const [device, setDevice] = useState('all');
  const [deviceOptions] = useState<DeviceOption[]>([
    { value: 'all', label: 'All Devices' }
  ]);
  
  // Loading states
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);
  
  // Data states
  const [metricsData, setMetricsData] = useState({
    totalVerifications: 0,
    successRate: 0,
    averageConfidence: 0,
    uniqueDevices: 0
  });

  const [chartData, setChartData] = useState({
    verificationStats: {
      success: 0,
      failed: 0
    },
    dailyStats: [] as Array<{
      date: string;
      total: number;
      success: number;
      failed: number;
    }>
  });

  // Format dates for API
  const formatDateForApi = (date: Date) => {
    return format(date, "yyyy-MM-dd");
  };

  // Calculate metrics from history items
  const calculateMetrics = useCallback((items: HistoryItem[]) => {
    if (!items || items.length === 0) {
      setMetricsData({
        totalVerifications: 0,
        successRate: 0,
        averageConfidence: 0,
        uniqueDevices: 0
      });
      return;
    }
    
    // Total verifications is the count of items
    const totalVerifications = items.length;
    
    // Success rate is the percentage of items with status SUCCESS
    const successItems = items.filter(item => item.status === "SUCCESS");
    const successRate = (successItems.length / totalVerifications) * 100;
    
    // Average confidence is the mean of all confidence values
    const totalConfidence = items.reduce((sum, item) => {
      return sum + (typeof item.confidence === 'number' ? item.confidence : 0);
    }, 0);
    const averageConfidence = (totalConfidence / totalVerifications) * 100;
    
    // Unique devices is the count of unique device_info objects
    const deviceIds = new Set();
    items.forEach(item => {
      if (item.device_info && item.device_info.id) {
        deviceIds.add(item.device_info.id);
      } else if (item.device_info && item.device_info.deviceId) {
        deviceIds.add(item.device_info.deviceId);
      }
    });
    const uniqueDevices = deviceIds.size;
    
    setMetricsData({
      totalVerifications,
      successRate,
      averageConfidence,
      uniqueDevices: uniqueDevices || items.length // Fallback if no device IDs
    });
  }, []);
  
  // Calculate chart data from history items
  const calculateChartData = useCallback((items: HistoryItem[]) => {
    if (!items || items.length === 0) {
      setChartData({
        verificationStats: { success: 0, failed: 0 },
        dailyStats: []
      });
      return;
    }
    
    // Calculate success vs failed stats
    const successCount = items.filter(item => item.status === "SUCCESS").length;
    const failedCount = items.filter(item => item.status === "FAILED").length;
    
    // Group items by date for daily stats
    const dailyMap = new Map<string, { total: number, success: number, failed: number }>();
    
    items.forEach(item => {
      const timeField = item.time || item.login_time || item.server_time;
      if (!timeField) return;
      
      const date = new Date(timeField);
      const dateStr = format(date, "yyyy-MM-dd");
      
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, { total: 0, success: 0, failed: 0 });
      }
      
      const dayStats = dailyMap.get(dateStr)!;
      dayStats.total += 1;
      
      if (item.status === "SUCCESS") {
        dayStats.success += 1;
      } else if (item.status === "FAILED") {
        dayStats.failed += 1;
      }
    });
    
    // Convert map to array and sort by date
    const dailyStats = Array.from(dailyMap.entries()).map(([date, stats]) => ({
      date,
      ...stats
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    setChartData({
      verificationStats: {
        success: successCount,
        failed: failedCount
      },
      dailyStats
    });
  }, []);

  // Fetch metrics and chart data from history API
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoadingMetrics(true);
      setIsLoadingCharts(true);
      
      const params = {
        start_date: formatDateForApi(startDate),
        end_date: formatDateForApi(endDate),
        status: status !== 'all' ? status.toUpperCase() : undefined,
        device_id: device !== 'all' ? device : undefined,
        current_page: "1",
        per_page: "1000",
        all: "true"
      };
      
      console.log("Fetching dashboard data with params:", params);
      const response = await getHistory(params);
      console.log("History API Response:", response);
      
      if (response.success) {
        // Extract items from response
        let historyItems: HistoryItem[] = [];
        
        if (response.data && typeof response.data === 'object' && !Array.isArray(response.data) && 'items' in response.data) {
          historyItems = response.data.items;
        } else if (Array.isArray(response.data)) {
          historyItems = response.data;
        } else if (response.items && Array.isArray(response.items)) {
          historyItems = response.items;
        }
        
        // Calculate metrics
        calculateMetrics(historyItems);
        
        // Calculate chart data
        calculateChartData(historyItems);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoadingMetrics(false);
      setIsLoadingCharts(false);
    }
  }, [startDate, endDate, status, device, calculateMetrics, calculateChartData]);

  // Handle data export
  const handleExport = () => {
    const params = new URLSearchParams({
      start_date: formatDateForApi(startDate),
      end_date: formatDateForApi(endDate),
      status: status !== 'all' ? status.toUpperCase() : '',
      device_id: device !== 'all' ? device : ''
    });
    
    // Create a download link for the export
    const exportUrl = `${process.env.NEXT_PUBLIC_API_URL}/export/history/?${params.toString()}`;
    window.open(exportUrl, '_blank');
  };

  // Load data on component mount and when filters change
  useEffect(() => {
    fetchDashboardData();
  }, [startDate, endDate, status, device, fetchDashboardData]);

  // Create filter params for history component
  const historyFilterParams = {
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
    status: status !== 'all' ? status.toUpperCase() : undefined,
    deviceId: device !== 'all' ? device : undefined
  };

  return (
    <div className="space-y-6">
      <Filter 
        startDate={startDate}
        endDate={endDate}
        status={status}
        device={device}
        deviceOptions={deviceOptions}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onStatusChange={setStatus}
        onDeviceChange={setDevice}
        onExport={handleExport}
        onRefresh={fetchDashboardData}
        isLoading={isLoadingMetrics || isLoadingCharts}
      />

      {/* Metrics Section */}
      <Metrics 
        data={metricsData} 
        isLoading={isLoadingMetrics} 
      />

      {/* Charts Section */}
      <Charts 
        verificationStats={chartData.verificationStats}
        dailyStats={chartData.dailyStats}
        isLoading={isLoadingCharts}
      />

      {/* History Section */}
      <History filterParams={historyFilterParams} />
    </div>
  );
}