import api from './axios';
import { extractItems } from './utils';

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

// Define possible API response types
export interface NotificationsResponse {
    success?: boolean;
    message?: string;
    items?: Notification[];
    data?: Notification[] | {
        items?: Notification[];
        current_page?: number;
        per_page?: number;
        total?: number;
    };
    [key: string]: unknown;
}

// Get list of notifications (admin - all, user - only their own)
export const getNotifications = async (params?: {
    current_page?: number;
    per_page?: number;
    all?: boolean;
}): Promise<Notification[]> => {
    const response = await api.get('/api/v1/notifications/', { params });
    return extractItems<Notification>(response.data);
};

// Get notifications for current user
export const getUserNotifications = async (params?: {
    current_page?: number;
    per_page?: number;
    all?: boolean;
}): Promise<Notification[]> => {
    const response = await api.get('/api/v1/notifications/user/', { params });
    return extractItems<Notification>(response.data);
};

// Create new notification (admin only)
export const createNotification = async (data: CreateNotificationData): Promise<Notification> => {
    const response = await api.post('/api/v1/notifications/', data);
    return response.data;
};

// Mark notification as read
export const markNotificationRead = async (notificationId: number): Promise<void> => {
    await api.post(`/api/v1/notifications/${notificationId}/mark-read/`);
};

// Register device token
export const registerDeviceToken = async (deviceToken: string, platform?: string): Promise<void> => {
    await api.post('/api/v1/notifications/register-device/', {
        device_token: deviceToken,
        platform: platform || 'web',
    });
};

