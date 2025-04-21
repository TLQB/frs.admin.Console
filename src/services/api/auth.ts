import api from './axios';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export interface User {
    id: string;
    email: string;
    role?: string;
}

export interface ApiError {
    error: string;
    statusCode: number;
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/admins/login/', { username, password });
    return response.data;
};