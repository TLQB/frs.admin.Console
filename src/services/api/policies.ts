import api from './axios';

export interface Policy {
    id: number;
    code: string;
    name: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export interface PolicyGroup {
    id: number;
    name: string;
    description?: string;
    policies?: number[];
    created_at?: string;
    updated_at?: string;
}

export interface UserRole {
    id: number;
    user_id: number;
    role: string;
    created_at?: string;
    updated_at?: string;
}

export interface UserPolicy {
    id: number;
    user_id: number;
    policy: number;
    granted: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface UserPolicyGroup {
    id: number;
    user_id: number;
    policy_group: number;
    granted: boolean;
    created_at?: string;
    updated_at?: string;
}

// Policies CRUD
export const getListPolicies = async (): Promise<Policy[]> => {
    const response = await api.get('/api/v1/policies/');
    return response.data;
};

export const getDetailPolicy = async (id: number): Promise<Policy> => {
    const response = await api.get(`/api/v1/policies/${id}/`);
    return response.data;
};

export const createPolicy = async (data: Partial<Policy>): Promise<Policy> => {
    const response = await api.post('/api/v1/policies/', data);
    return response.data;
};

export const updatePolicy = async (id: number, data: Partial<Policy>): Promise<Policy> => {
    const response = await api.patch(`/api/v1/policies/${id}/`, data);
    return response.data;
};

export const deletePolicy = async (id: number): Promise<void> => {
    await api.delete(`/api/v1/policies/${id}/`);
};

// Policy Groups CRUD
export const getListPolicyGroups = async (): Promise<PolicyGroup[]> => {
    const response = await api.get('/api/v1/policy-groups/');
    return response.data;
};

export const getDetailPolicyGroup = async (id: number): Promise<PolicyGroup> => {
    const response = await api.get(`/api/v1/policy-groups/${id}/`);
    return response.data;
};

export const createPolicyGroup = async (data: Partial<PolicyGroup>): Promise<PolicyGroup> => {
    const response = await api.post('/api/v1/policy-groups/', data);
    return response.data;
};

export const updatePolicyGroup = async (id: number, data: Partial<PolicyGroup>): Promise<PolicyGroup> => {
    const response = await api.patch(`/api/v1/policy-groups/${id}/`, data);
    return response.data;
};

export const deletePolicyGroup = async (id: number): Promise<void> => {
    await api.delete(`/api/v1/policy-groups/${id}/`);
};

// User Roles CRUD
export const getListUserRoles = async (): Promise<UserRole[]> => {
    const response = await api.get('/api/v1/user-roles/');
    return response.data;
};

export const getDetailUserRole = async (id: number): Promise<UserRole> => {
    const response = await api.get(`/api/v1/user-roles/${id}/`);
    return response.data;
};

export const createUserRole = async (data: Partial<UserRole>): Promise<UserRole> => {
    const response = await api.post('/api/v1/user-roles/', data);
    return response.data;
};

export const updateUserRole = async (id: number, data: Partial<UserRole>): Promise<UserRole> => {
    const response = await api.patch(`/api/v1/user-roles/${id}/`, data);
    return response.data;
};

export const deleteUserRole = async (id: number): Promise<void> => {
    await api.delete(`/api/v1/user-roles/${id}/`);
};

// User Policies CRUD
export const getListUserPolicies = async (): Promise<UserPolicy[]> => {
    const response = await api.get('/api/v1/user-policies/');
    return response.data;
};

export const getDetailUserPolicy = async (id: number): Promise<UserPolicy> => {
    const response = await api.get(`/api/v1/user-policies/${id}/`);
    return response.data;
};

export const createUserPolicy = async (data: Partial<UserPolicy>): Promise<UserPolicy> => {
    const response = await api.post('/api/v1/user-policies/', data);
    return response.data;
};

export const updateUserPolicy = async (id: number, data: Partial<UserPolicy>): Promise<UserPolicy> => {
    const response = await api.patch(`/api/v1/user-policies/${id}/`, data);
    return response.data;
};

export const deleteUserPolicy = async (id: number): Promise<void> => {
    await api.delete(`/api/v1/user-policies/${id}/`);
};

// User Policy Groups CRUD
export const getListUserPolicyGroups = async (): Promise<UserPolicyGroup[]> => {
    const response = await api.get('/api/v1/user-policy-groups/');
    return response.data;
};

export const getDetailUserPolicyGroup = async (id: number): Promise<UserPolicyGroup> => {
    const response = await api.get(`/api/v1/user-policy-groups/${id}/`);
    return response.data;
};

export const createUserPolicyGroup = async (data: Partial<UserPolicyGroup>): Promise<UserPolicyGroup> => {
    const response = await api.post('/api/v1/user-policy-groups/', data);
    return response.data;
};

export const updateUserPolicyGroup = async (id: number, data: Partial<UserPolicyGroup>): Promise<UserPolicyGroup> => {
    const response = await api.patch(`/api/v1/user-policy-groups/${id}/`, data);
    return response.data;
};

export const deleteUserPolicyGroup = async (id: number): Promise<void> => {
    await api.delete(`/api/v1/user-policy-groups/${id}/`);
};

