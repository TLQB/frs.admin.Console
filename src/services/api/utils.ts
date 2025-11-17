export function extractItems<T>(response: any): T[] {
    if (!response) return [];
    if (Array.isArray(response)) return response as T[];
    if (Array.isArray(response.items)) return response.items as T[];
    if (Array.isArray(response.data)) return response.data as T[];
    if (response.data && Array.isArray(response.data.items)) return response.data.items as T[];
    if (response.data?.data && Array.isArray(response.data.data.items)) return response.data.data.items as T[];
    if (response.data?.data?.data && Array.isArray(response.data.data.data.items)) return response.data.data.data.items as T[];
    return [];
}


