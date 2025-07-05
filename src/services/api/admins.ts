import api from './axios';

// Định nghĩa response của endpoint /login
export interface Admin {
    id: number;
    name: string;
    email: string;
    is_mailauth_completed: boolean;
    is_master: boolean;
    is_enabled: boolean;
    config: Record<string, unknown>;
}

export interface AdminResponse {
    success?: boolean;
    message?: string;
    items?: Admin[];
    data?: Admin[] | {
        items?: Admin[];
        current_page?: number;
        per_page?: number;
        total?: number;
    };
    [key: string]: unknown;
}

export interface CreateAdminData {
    name: string;
    email: string;
    config: object;
    is_master: boolean;
    is_enabled: boolean;
    is_mailauth_completed: boolean;
}

export interface RefreshTokenResponse {
    access_token: string;
    refresh_token?: string;
    [key: string]: unknown;
}

export const checkRefreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post('/admins/check/', { "refresh_token": refreshToken });
    return response.data;
};

export const getListAdmin = async (): Promise<AdminResponse | Admin[]> => {
    const response = await api.get('/admins/', {});
    return response.data;
};

export const getDetailAdmin = async (id: string): Promise<Admin> => {
    const adminId = parseInt(id);
    const response = await api.get(`/admins/${adminId}/`, {});
    return response.data;
};

export const createAdmin = async (data: CreateAdminData): Promise<Admin> => {
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