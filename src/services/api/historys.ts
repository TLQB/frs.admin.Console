import api from './axios';

export interface HistoryParams {
  current_page?: string | number;
  per_page?: string | number;
  page?: number;
  limit?: number;
  search?: string;
  search_by?: string;
  sort_by?: string;
  sort_direction?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  device_id?: string;
  all?: string;
}

export const getHistory = async (params: HistoryParams) => {
    // Convert parameters to match API expectations
    const apiParams = {
        ...params,
        // Ensure we're using the correct parameter names
        current_page: params.current_page || params.page,
        per_page: params.per_page || params.limit
    };
    
    // Remove old parameter names to avoid conflicts
    if ('page' in apiParams) delete apiParams.page;
    if ('limit' in apiParams) delete apiParams.limit;
    
    console.log("API params being sent:", apiParams);
    const response = await api.get('/history-recognization/', { params: apiParams });
    return response.data;
};

export const getDashboardMetrics = async (params: Omit<HistoryParams, 'page' | 'limit' | 'search' | 'sort_by' | 'sort_direction'>) => {
    const response = await api.get('/dashboard/metrics/', { params });
    return response.data;
};

export const getDashboardCharts = async (params: Omit<HistoryParams, 'page' | 'limit' | 'search' | 'sort_by' | 'sort_direction'>) => {
    const response = await api.get('/dashboard/charts/', { params });
    return response.data;
};

// export const getDeviceList = async () => {
//     const response = await api.get('/devices/');
//     return response.data;
// };

export const getUserInfo = async (userId: number) => {
    const response = await api.get(`/users/${userId}/`);
    return response.data;
};

// Lấy thông tin nhiều user cùng lúc
export const getUsersInfo = async (userIds: number[]) => {
    // Loại bỏ các ID trùng lặp
    const uniqueIds = [...new Set(userIds)];
    
    // Nếu không có ID nào, trả về mảng rỗng
    if (uniqueIds.length === 0) {
        return { success: true, data: [] };
    }
    
    const params = { ids: uniqueIds.join(',') };
    const response = await api.get('/users/', { params });
    return response.data;
};
