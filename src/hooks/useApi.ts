import { useState, useCallback } from 'react';

interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    isLoading: boolean;
}

interface RequestOptions {
    headers?: Record<string, string>;
    body?: unknown;
    params?: Record<string, string>;
}

const useApi = <T>(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || '') => {
    const [state, setState] = useState<ApiResponse<T>>({
        data: null,
        error: null,
        isLoading: false,
    });

    const buildUrl = useCallback((endpoint: string, params?: Record<string, string>) => {
        // Check if endpoint is already a full URL
        let urlString;
        if (endpoint.startsWith('http')) {
            urlString = endpoint;
        } else {
            urlString = `${baseUrl}${endpoint}`;
        }

        try {
            const url = new URL(urlString);

            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    url.searchParams.append(key, value);
                });
            }

            return url.toString();
        } catch {
            console.error('Invalid URL:', urlString);
            return urlString;
        }
    }, [baseUrl]);

    const request = useCallback(async <R = T>(
        method: string,
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<ApiResponse<R>> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const { headers = {}, body, params } = options;
            const url = buildUrl(endpoint, params);

            const requestInit: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    ...headers
                },
                body: body ? JSON.stringify(body) : undefined,
                mode: 'no-cors',
                credentials: 'include'
            };

            console.log('Request:', url, method, body);
            const response = await fetch(url, requestInit);

            if (response.type === 'opaque') {
                console.log('Received opaque response - cannot read content');
                setState({ data: null, error: null, isLoading: false });
                return { data: null, error: null, isLoading: false };
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            const data = await response.json();
            setState({ data, error: null, isLoading: false });
            return { data, error: null, isLoading: false };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('API Error:', errorMessage);
            setState({ data: null, error: errorMessage, isLoading: false });
            return { data: null, error: errorMessage, isLoading: false };
        }
    }, [buildUrl]);

    const get = useCallback(<R = T>(
        endpoint: string,
        options: Omit<RequestOptions, 'body'> = {}
    ) => {
        return request<R>('GET', endpoint, options);
    }, [request]);

    const post = useCallback(<R = T>(
        endpoint: string,
        data: unknown,
        options: Omit<RequestOptions, 'body'> = {}
    ) => {
        return request<R>('POST', endpoint, { ...options, body: data });
    }, [request]);

    const put = useCallback(<R = T>(
        endpoint: string,
        data: unknown,
        options: Omit<RequestOptions, 'body'> = {}
    ) => {
        return request<R>('PUT', endpoint, { ...options, body: data });
    }, [request]);

    const patch = useCallback(<R = T>(
        endpoint: string,
        data: unknown,
        options: Omit<RequestOptions, 'body'> = {}
    ) => {
        return request<R>('PATCH', endpoint, { ...options, body: data });
    }, [request]);

    const del = useCallback(<R = T>(
        endpoint: string,
        options: RequestOptions = {}
    ) => {
        return request<R>('DELETE', endpoint, options);
    }, [request]);

    return {
        ...state,
        get,
        post,
        put,
        patch,
        delete: del,
    };
};

export default useApi; 