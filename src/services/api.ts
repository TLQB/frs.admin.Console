import useApi from '../hooks/useApi';

// Define types for your API responses
export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// API endpoints constants
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/admins/login/',
        REGISTER: '/api/register',
        LOGOUT: '/api/logout',
        REFRESH_TOKEN: '/api/refresh-token',
        FORGOT_PASSWORD: '/api/forgot-password',
        RESET_PASSWORD: '/api/reset-password',
    },
    USERS: {
        BASE: '/api/users',
        BY_ID: (id: string) => `/api/users/${id}`,
    },
    PROFILE: '/api/profile',
    // Add more endpoints as needed
};

// Create API service hooks
export const useAuthService = () => {
    const api = useApi<AuthResponse>('');  // Empty base URL for direct URL

    return {
        login: (username: string, password: string) =>
            api.post('http://localhost:8000/api/admins/login/', { username, password }),
        register: (userData: Partial<User> & { password: string }) =>
            api.post(API_ENDPOINTS.AUTH.REGISTER, userData),
        logout: () =>
            api.post(API_ENDPOINTS.AUTH.LOGOUT, {}),
        forgotPassword: (email: string) =>
            api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),
        resetPassword: (token: string, password: string) =>
            api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),
    };
};

export const useUserService = () => {
    const api = useApi<PaginatedResponse<User> | User>();

    return {
        getUsers: (page: number = 1, limit: number = 10) =>
            api.get<PaginatedResponse<User>>(API_ENDPOINTS.USERS.BASE, {
                params: { page: page.toString(), limit: limit.toString() }
            }),
        getUserById: (id: string) =>
            api.get<User>(API_ENDPOINTS.USERS.BY_ID(id)),
        createUser: (userData: Partial<User>) =>
            api.post<User>(API_ENDPOINTS.USERS.BASE, userData),
        updateUser: (id: string, userData: Partial<User>) =>
            api.put<User>(API_ENDPOINTS.USERS.BY_ID(id), userData),
        deleteUser: (id: string) =>
            api.delete(API_ENDPOINTS.USERS.BY_ID(id)),
    };
};

export const useProfileService = () => {
    const api = useApi<User>();

    return {
        getProfile: () => api.get(API_ENDPOINTS.PROFILE),
        updateProfile: (profileData: Partial<User>) =>
            api.put(API_ENDPOINTS.PROFILE, profileData),
    };
};

// You can add more service hooks as needed 