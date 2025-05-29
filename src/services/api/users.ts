import api from './axios';

// Định nghĩa response của endpoint /login
export interface User {
    id: number;
    name: string;
    email: string;
    is_mailauth_completed: boolean;
    is_enabled: boolean;
    config: object;
}



export const getListUser = async (): Promise<User> => {
    const response = await api.get('/users/', {});
    return response.data;
};

export const getDetailUser = async (id: string): Promise<User> => {
    const userId = parseInt(id);
    const response = await api.get(`/users/${userId}/`, {});
    return response.data;
};

export const createUser = async (data: User): Promise<User> => {
    const response = await api.post('/users/', data);
    return response.data;
};

export const updateUser = async (id: string, data: User): Promise<User> => {
    const userId = parseInt(id);
    const response = await api.patch(`/users/${userId}/`, data);
    return response.data;
};

export const deleteUser = async (id: string): Promise<User> => {
    const userId = parseInt(id);
    const response = await api.delete(`/users/${userId}/`, {});
    return response.data;
};