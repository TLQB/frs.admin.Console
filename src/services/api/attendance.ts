import api from './axios';
import { extractItems } from './utils';

export interface Checkin {
    id: number;
    employee: number;
    timestamp: string;
    checkin_type?: 'checkin' | 'checkout';
    location?: string;
    latitude?: number;
    longitude?: number;
    device_id?: string;
    image?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CheckinResponse {
    success?: boolean;
    message?: string;
    items?: Checkin[];
    data?: Checkin[] | {
        items?: Checkin[];
        current_page?: number;
        per_page?: number;
        total?: number;
    };
    [key: string]: unknown;
}

export interface CreateCheckinData {
    timestamp?: string;
    checkin_type?: 'checkin' | 'checkout';
    location?: string;
    latitude?: number;
    longitude?: number;
    device_id?: string;
    image?: File | string;
    notes?: string;
}

// Get list of checkins (for current user)
export const getListCheckins = async (params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
}): Promise<Checkin[]> => {
    const response = await api.get('/api/v1/checkins/', { params });
    return extractItems<Checkin>(response.data);
};

// Get detail checkin
export const getDetailCheckin = async (id: string | number): Promise<Checkin> => {
    const checkinId = typeof id === 'string' ? parseInt(id) : id;
    const response = await api.get(`/api/v1/checkins/${checkinId}/`);
    return response.data;
};

// Create checkin
export const createCheckin = async (data: CreateCheckinData): Promise<Checkin> => {
    const formData = new FormData();
    
    if (data.timestamp) formData.append('timestamp', data.timestamp);
    if (data.checkin_type) formData.append('checkin_type', data.checkin_type);
    if (data.location) formData.append('location', data.location);
    if (data.latitude !== undefined) formData.append('latitude', data.latitude.toString());
    if (data.longitude !== undefined) formData.append('longitude', data.longitude.toString());
    if (data.device_id) formData.append('device_id', data.device_id);
    if (data.image instanceof File) formData.append('image', data.image);
    if (data.image && typeof data.image === 'string') formData.append('image', data.image);
    if (data.notes) formData.append('notes', data.notes);

    const response = await api.post('/api/v1/checkins/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Update checkin
export const updateCheckin = async (id: string | number, data: Partial<CreateCheckinData>): Promise<Checkin> => {
    const checkinId = typeof id === 'string' ? parseInt(id) : id;
    const formData = new FormData();
    
    if (data.timestamp) formData.append('timestamp', data.timestamp);
    if (data.checkin_type) formData.append('checkin_type', data.checkin_type);
    if (data.location) formData.append('location', data.location);
    if (data.latitude !== undefined) formData.append('latitude', data.latitude.toString());
    if (data.longitude !== undefined) formData.append('longitude', data.longitude.toString());
    if (data.device_id) formData.append('device_id', data.device_id);
    if (data.image instanceof File) formData.append('image', data.image);
    if (data.image && typeof data.image === 'string') formData.append('image', data.image);
    if (data.notes) formData.append('notes', data.notes);

    const response = await api.patch(`/api/v1/checkins/${checkinId}/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Delete checkin
export const deleteCheckin = async (id: string | number): Promise<void> => {
    const checkinId = typeof id === 'string' ? parseInt(id) : id;
    await api.delete(`/api/v1/checkins/${checkinId}/`);
};

