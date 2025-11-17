import api from './axios';

export interface FaceEmbedding {
    id: number;
    user_id: number;
    embedding?: number[];
    created?: string;
    updated?: string;
}

export interface FaceRegister {
    id: number;
    face_embedding: number;
    image: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    created?: string;
}

export interface HistoryRecognition {
    id: number;
    user_id: number;
    image: string;
    confidence?: number;
    timestamp: string;
    location?: string;
    device_id?: string;
    created?: string;
}

export interface FaceRegistrationResponse {
    success?: boolean;
    message?: string;
    task_id?: string;
    face_embedding_id?: number;
    created?: boolean;
    data?: {
        items?: FaceEmbedding[];
        current_page?: number;
        per_page?: number;
        total?: number;
    };
    [key: string]: unknown;
}

export interface FaceRegistrationStatusResponse {
    status: 'processing' | 'success' | 'failed' | 'unknown';
    message: string;
    progress?: Record<string, unknown>;
    result?: Record<string, unknown>;
    error?: string;
}

export interface FaceVerificationResponse {
    success: boolean;
    message?: string;
    error_code?: string;
    confidence?: number;
    user_id?: number;
    match?: boolean;
}

export interface HistoryRecognitionResponse {
    success?: boolean;
    message?: string;
    items?: HistoryRecognition[];
    data?: HistoryRecognition[] | {
        items?: HistoryRecognition[];
        current_page?: number;
        per_page?: number;
        total?: number;
    };
    [key: string]: unknown;
}

// Register face (get list of registered faces)
export const getRegisteredFaces = async (params?: {
    current_page?: number;
    per_page?: number;
    all?: boolean;
}): Promise<FaceRegistrationResponse> => {
    const response = await api.get('/api/v1/faces/register/', { params });
    return response.data;
};

// Register face (upload images)
export const registerFace = async (
    images: File[],
    sync: boolean = false
): Promise<FaceRegistrationResponse> => {
    const formData = new FormData();
    images.forEach((image) => {
        formData.append('images', image);
    });

    const params = sync ? { sync: 'true' } : {};
    const response = await api.post('/api/v1/faces/register/', formData, {
        params,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Get registration status (for async registration)
export const getFaceRegistrationStatus = async (taskId: string): Promise<FaceRegistrationStatusResponse> => {
    const response = await api.get(`/api/v1/faces/register/status/${taskId}/`);
    return response.data;
};

// Delete registered face
export const deleteRegisteredFace = async (id: number): Promise<void> => {
    await api.delete(`/api/v1/faces/register/${id}/`);
};

// Verify face
export const verifyFace = async (image: File): Promise<FaceVerificationResponse> => {
    const formData = new FormData();
    formData.append('image', image);

    const response = await api.post('/api/v1/faces/verify/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Get recognition history
// Temporarily disabled - API history_recognizations is disabled
export const getRecognitionHistory = async (params?: {
    current_page?: number;
    per_page?: number;
    all?: boolean;
    start_date?: string;
    end_date?: string;
    user_id?: number;
}): Promise<HistoryRecognitionResponse> => {
    // Recognition History API is temporarily disabled
    return {
        success: true,
        message: "Recognition History API is temporarily disabled",
        data: {
            items: [],
            current_page: 1,
            per_page: 10,
            total: 0
        }
    };
    
    // Original code (commented out):
    // const response = await api.get('/api/v1/faces/history/', { params });
    // return response.data;
};

