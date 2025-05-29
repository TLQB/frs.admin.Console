import api from './axios';

// Định nghĩa response của endpoint /login
export interface Admin {
    id: number;
    name: string;
    email: string;
    is_mailauth_completed: boolean;
    is_master: boolean;
    is_enabled: boolean;
    config: object;
}

export const checkRefreshToken = async (refreshToken: string) => {
    const response = await api.post('/admins/check/', { "refresh_token": refreshToken });
    return response.data;
};

export const getListAdmin = async (): Promise<Admin> => {
    const response = await api.get('/admins/', {});
    return response.data;
};

export const getDetailAdmin = async (id: string): Promise<Admin> => {
    const adminId = parseInt(id);
    const response = await api.get(`/admins/${adminId}/`, {});
    return response.data;
};

export const createAdmin = async (data: Admin): Promise<Admin> => {
    const response = await api.post('/admins/', data);
    return response.data;
};

export const updateAdmin = async (id: string, data: Admin): Promise<Admin> => {
    const adminId = parseInt(id);
    const response = await api.patch(`/admins/${adminId}/`, data);
    return response.data;
};

export const deleteAdmin = async (id: number): Promise<Admin> => {
    const adminId = id;
    const response = await api.delete(`/admins/${adminId}/`, {});
    return response.data;
};