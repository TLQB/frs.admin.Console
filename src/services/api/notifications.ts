import api from './axios';

export interface Notification {
    id: number;
    title: string;
    body: string;
    notification_type: string;
    topic?: string;
    device_token?: string;
    is_sent: boolean;
    created: string;
    data?: Record<string, string>;
    urgent?: boolean;
}

export interface CreateNotificationData {
    title: string;
    body: string;
    notification_type: string;
    topic?: string;
    device_token?: string;
    data?: Record<string, string>;
    urgent?: boolean;
}

export interface UpdateNotificationData {
    title?: string;
    body?: string;
    notification_type?: string;
    topic?: string;
    device_token?: string;
    data?: Record<string, string>;
    urgent?: boolean;
}

// Lấy danh sách thông báo
export const getNotifications = async (): Promise<Notification[]> => {
    const response = await api.get('/notifications/');
    return response.data;
};

// Lấy thông báo theo ID
export const getNotification = async (id: number): Promise<Notification> => {
    const response = await api.get(`/notifications/${id}/`);
    return response.data;
};

// Tạo thông báo mới
export const createNotification = async (data: CreateNotificationData): Promise<Notification> => {
    const response = await api.post('/notifications/', data);
    return response.data;
};

// Cập nhật thông báo
export const updateNotification = async (id: number, data: UpdateNotificationData): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/`, data);
    return response.data;
};

// Xóa thông báo
export const deleteNotification = async (id: number): Promise<void> => {
    await api.delete(`/notifications/${id}/`);
};

// Gửi thông báo
export const sendNotification = async (id: number): Promise<Notification> => {
    const response = await api.post(`/notifications/${id}/send/`);
    return response.data;
};

// Lấy danh sách topics
export const getTopics = async (): Promise<string[]> => {
    const response = await api.get('/notifications/topics/');
    return response.data;
};

// Lấy danh sách device tokens
export const getDeviceTokens = async (): Promise<string[]> => {
    const response = await api.get('/notifications/device-tokens/');
    return response.data;
};

