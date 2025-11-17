import api from './axios';
import { extractItems } from './utils';

export interface LeaveRequest {
    id: number;
    employee: number;
    leave_type: string;
    start_date: string;
    end_date: string;
    reason?: string;
    status?: 'pending' | 'approved' | 'rejected';
    approved_by?: number;
    approved_at?: string;
    created_at?: string;
    updated_at?: string;
}

export interface LeaveRequestResponse {
    success?: boolean;
    message?: string;
    items?: LeaveRequest[];
    data?: LeaveRequest[] | {
        items?: LeaveRequest[];
        current_page?: number;
        per_page?: number;
        total?: number;
    };
    [key: string]: unknown;
}

export interface CreateLeaveRequestData {
    leave_type: string;
    start_date: string;
    end_date: string;
    reason?: string;
}

// Get list of leave requests (for current user)
export const getListLeaves = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
}): Promise<LeaveRequest[]> => {
    const response = await api.get('/api/v1/leaves/', { params });
    return extractItems<LeaveRequest>(response.data);
};

// Get detail leave request
export const getDetailLeave = async (id: string | number): Promise<LeaveRequest> => {
    const leaveId = typeof id === 'string' ? parseInt(id) : id;
    const response = await api.get(`/api/v1/leaves/${leaveId}/`);
    return response.data;
};

// Create leave request
export const createLeave = async (data: CreateLeaveRequestData): Promise<LeaveRequest> => {
    const response = await api.post('/api/v1/leaves/', data);
    return response.data;
};

// Update leave request
export const updateLeave = async (id: string | number, data: Partial<CreateLeaveRequestData>): Promise<LeaveRequest> => {
    const leaveId = typeof id === 'string' ? parseInt(id) : id;
    const response = await api.patch(`/api/v1/leaves/${leaveId}/`, data);
    return response.data;
};

// Delete leave request
export const deleteLeave = async (id: string | number): Promise<void> => {
    const leaveId = typeof id === 'string' ? parseInt(id) : id;
    await api.delete(`/api/v1/leaves/${leaveId}/`);
};

