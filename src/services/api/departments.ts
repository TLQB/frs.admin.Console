import api from './axios';

export interface Department {
    id: number;
    name: string;
    code?: string;
    parent?: number;
    is_active: boolean;
    description?: string;
    created_by_user_id?: number;
    created_at?: string;
    updated_at?: string;
    children?: Department[];
}

export interface DepartmentTree extends Department {
    children?: DepartmentTree[];
}

export interface DepartmentResponse {
    success?: boolean;
    message?: string;
    items?: Department[];
    data?: Department[] | {
        items?: Department[];
        current_page?: number;
        per_page?: number;
        total?: number;
    };
    [key: string]: unknown;
}

export interface CreateDepartmentData {
    name: string;
    code?: string;
    parent?: number;
    is_active?: boolean;
    description?: string;
}

// Basic CRUD operations
export const getListDepartments = async (params?: {
    is_active?: boolean;
    parent?: number | null;
    search?: string;
}): Promise<DepartmentResponse | Department[]> => {
    const response = await api.get('/api/v1/departments/', { params });
    return response.data;
};

export const getDetailDepartment = async (id: string | number): Promise<Department> => {
    const departmentId = typeof id === 'string' ? parseInt(id) : id;
    const response = await api.get(`/api/v1/departments/${departmentId}/`);
    return response.data;
};

export const createDepartment = async (data: CreateDepartmentData): Promise<Department> => {
    const response = await api.post('/api/v1/departments/', data);
    return response.data;
};

export const updateDepartment = async (id: string | number, data: Partial<Department>): Promise<Department> => {
    const departmentId = typeof id === 'string' ? parseInt(id) : id;
    const response = await api.patch(`/api/v1/departments/${departmentId}/`, data);
    return response.data;
};

export const deleteDepartment = async (id: string | number): Promise<void> => {
    const departmentId = typeof id === 'string' ? parseInt(id) : id;
    await api.delete(`/api/v1/departments/${departmentId}/`);
};

// Special endpoints
export const getDepartmentTree = async (): Promise<DepartmentTree[]> => {
    const response = await api.get('/api/v1/departments/tree/');
    return response.data;
};

export const getRootDepartments = async (): Promise<Department[]> => {
    const response = await api.get('/api/v1/departments/root/');
    return response.data;
};

export const getDepartmentChildren = async (id: string | number): Promise<Department[]> => {
    const departmentId = typeof id === 'string' ? parseInt(id) : id;
    const response = await api.get(`/api/v1/departments/${departmentId}/children/`);
    return response.data;
};

export const getAllDepartmentChildren = async (id: string | number): Promise<Department[]> => {
    const departmentId = typeof id === 'string' ? parseInt(id) : id;
    const response = await api.get(`/api/v1/departments/${departmentId}/all_children/`);
    return response.data;
};

export const getDepartmentEmployees = async (id: string | number): Promise<any[]> => {
    const departmentId = typeof id === 'string' ? parseInt(id) : id;
    const response = await api.get(`/api/v1/departments/${departmentId}/employees/`);
    return response.data;
};

