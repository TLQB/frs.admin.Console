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
    // Temporarily disabled - API history_recognizations is disabled
    // History API is temporarily disabled
    return {
        success: true,
        message: "History API is temporarily disabled",
        data: {
            items: [],
            current_page: 1,
            per_page: 10,
            total: 0
        }
    };
    
    // Original code (commented out):
    // // Convert parameters to match API expectations
    // const apiParams = {
    //     ...params,
    //     // Ensure we're using the correct parameter names
    //     current_page: params.current_page || params.page,
    //     per_page: params.per_page || params.limit
    // };
    // 
    // // Remove old parameter names to avoid conflicts
    // if ('page' in apiParams) delete apiParams.page;
    // if ('limit' in apiParams) delete apiParams.limit;
    // 
    // console.log("API params being sent:", apiParams);
    // const response = await api.get('/api/v1/faces/history/', { params: apiParams });
    // return response.data;
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
    const response = await api.get(`/api/v1/employees/${userId}/`);
    return response.data;
};

// Get information for multiple users at once (using employees endpoint)
export const getUsersInfo = async (userIds: number[]) => {
    // Remove duplicate IDs
    const uniqueIds = [...new Set(userIds)];
    
    // If no IDs, return empty array
    if (uniqueIds.length === 0) {
        return { success: true, data: [] };
    }
    
    // Fetch employees individually or use a filter if API supports it
    // For now, we'll fetch them individually
    const promises = uniqueIds.map(id => 
        api.get(`/api/v1/employees/${id}/`).then(res => res.data).catch(() => null)
    );
    const results = await Promise.all(promises);
    return { success: true, data: results.filter(Boolean) };
};
