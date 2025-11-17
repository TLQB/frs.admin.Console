import api from './axios';
import { extractItems } from './utils';

// Employee interface definition (replaces User)
export interface Employee {
    id: number;
    user_id: number;
    full_name: string;
    employee_code?: string;
    email?: string;
    phone?: string;
    department?: number;
    position?: number;
    avatar?: string;
    photo?: string;
    is_active?: boolean;
    attributes?: {
        employee_code?: string;
        code?: string;
        email?: string;
        phone?: string;
        [key: string]: any;
    };
    created_at?: string;
    updated_at?: string;
}

export interface Position {
    id: number;
    name: string;
    level?: number;
    department?: number;
    description?: string;
}

export interface EmployeeResponse {
    success?: boolean;
    message?: string;
    items?: Employee[];
    data?: Employee[] | {
        items?: Employee[];
        current_page?: number;
        per_page?: number;
        total?: number;
    };
    [key: string]: unknown;
}

export interface CreateEmployeeData {
    user_id: number;
    full_name: string;
    employee_code?: string;
    email?: string;
    phone?: string;
    department?: number;
    position?: number;
    avatar?: string;
    is_active?: boolean;
}

// Employees endpoints
export const getListEmployees = async (params?: {
    department?: number;
    position?: number;
    search?: string;
}): Promise<Employee[]> => {
    const response = await api.get('/api/v1/employees/', { params });
    return extractItems<Employee>(response.data);
};

export const getDetailEmployee = async (id: string | number): Promise<Employee> => {
    const employeeId = typeof id === 'string' ? parseInt(id) : id;
    const response = await api.get(`/api/v1/employees/${employeeId}/`);
    return response.data;
};

export const createEmployee = async (data: CreateEmployeeData): Promise<Employee> => {
    const response = await api.post('/api/v1/employees/', data);
    return response.data;
};

export const updateEmployee = async (id: string | number, data: Partial<Employee>): Promise<Employee> => {
    const employeeId = typeof id === 'string' ? parseInt(id) : id;
    const response = await api.patch(`/api/v1/employees/${employeeId}/`, data);
    return response.data;
};

export const deleteEmployee = async (id: string | number): Promise<void> => {
    const employeeId = typeof id === 'string' ? parseInt(id) : id;
    await api.delete(`/api/v1/employees/${employeeId}/`);
};

// Get current user's employee profile
export const getMyEmployeeProfile = async (): Promise<Employee> => {
    const response = await api.get('/api/v1/employees/me/');
    return response.data;
};

// Update current user's employee profile
export const updateMyEmployeeProfile = async (data: Partial<Employee> & { avatar?: any }): Promise<Employee> => {
    const formData = new FormData();
    
    if (data.full_name) formData.append('full_name', data.full_name);
    if (data.email) formData.append('email', data.email);
    if (data.phone) formData.append('phone', data.phone);
    if (data.employee_code) formData.append('employee_code', data.employee_code);
    if (data.department !== undefined) formData.append('department', data.department.toString());
    if (data.position !== undefined) formData.append('position', data.position.toString());
    if (data.avatar) {
        // Check if it's a File-like object
        if (typeof File !== 'undefined' && data.avatar instanceof File) {
            formData.append('photo', data.avatar);
        } else if (data.avatar && typeof data.avatar === 'object' && 'size' in data.avatar && 'type' in data.avatar) {
            formData.append('photo', data.avatar as File);
        }
    }
    
    const response = await api.patch('/api/v1/employees/me/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Get employees by department
export const getEmployeesByDepartment = async (departmentId: number): Promise<Employee[]> => {
    const response = await api.get(`/api/v1/employees/by_department/`, {
        params: { department: departmentId }
    });
    return response.data;
};

// Get employees by position
export const getEmployeesByPosition = async (positionId: number): Promise<Employee[]> => {
    const response = await api.get(`/api/v1/employees/by_position/`, {
        params: { position: positionId }
    });
    return response.data;
};

// Positions endpoints
export const getListPositions = async (params?: {
    department?: number;
}): Promise<Position[]> => {
    const response = await api.get('/api/v1/employees/positions/', { params });
    return extractItems<Position>(response.data);
};

export const getDetailPosition = async (id: string | number): Promise<Position> => {
    const positionId = typeof id === 'string' ? parseInt(id) : id;
    const response = await api.get(`/api/v1/employees/positions/${positionId}/`);
    return response.data;
};

export const createPosition = async (data: Partial<Position>): Promise<Position> => {
    const response = await api.post('/api/v1/employees/positions/', data);
    return response.data;
};

export const updatePosition = async (id: string | number, data: Partial<Position>): Promise<Position> => {
    const positionId = typeof id === 'string' ? parseInt(id) : id;
    const response = await api.patch(`/api/v1/employees/positions/${positionId}/`, data);
    return response.data;
};

export const deletePosition = async (id: string | number): Promise<void> => {
    const positionId = typeof id === 'string' ? parseInt(id) : id;
    await api.delete(`/api/v1/employees/positions/${positionId}/`);
};

// Get employees for a specific position
export const getPositionEmployees = async (positionId: number): Promise<Employee[]> => {
    const response = await api.get(`/api/v1/employees/positions/${positionId}/employees/`);
    return response.data;
};

