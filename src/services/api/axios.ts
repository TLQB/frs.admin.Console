
import axios from 'axios';
import Cookies from 'js-cookie';
import { checkRefreshToken } from './admins';
// import jwtDecode from 'jwt-decode';

// Khởi tạo Axios instance
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Hàng đợi các request bị tạm hoãn trong khi làm mới token
let refreshQueue: Array<(token: string) => void> = [];
let isRefreshing = false;

// Request Interceptor: Thêm access token vào header
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý refresh token khi token hết hạn
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        console.log(error.response.status, !originalRequest._retry, !isRefreshing)

        if (
            (error.response?.status === 401 || error.response?.status === 403) &&
            !originalRequest._retry &&
            !isRefreshing
        ) {
            originalRequest._retry = true;
            isRefreshing = true;

            try {

                const refreshToken = Cookies.get('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }
                Cookies.remove('access_token');
                const response = await checkRefreshToken(refreshToken);
                
                const newAccessToken = response.access_token;
                Cookies.set('access_token', newAccessToken, {
                    secure: true,
                    sameSite: 'strict',
                });

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                refreshQueue.forEach((cb) => cb(newAccessToken));
                refreshQueue = [];

                return api(originalRequest);


            } catch (refreshError) {
                console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>> ?????????")
                console.error('Token refresh failed:', refreshError);
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');
                if (typeof window !== 'undefined') {
                    window.location.href = '/signin'; 
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        } else if (isRefreshing) {
            return new Promise((resolve) => {
                refreshQueue.push((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    resolve(api(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);

export default api;