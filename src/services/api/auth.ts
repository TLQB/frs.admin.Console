import api from './axios';

export interface LoginRequest {
    name: string;  // Backend uses 'name' field as USERNAME_FIELD
    password: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    tenant_domain?: string;  // Optional tenant domain in response
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

export const login = async (name: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/api/v1/auth/login/', { name, password });
    return response.data;
};