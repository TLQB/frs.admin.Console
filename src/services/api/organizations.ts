import api from './axios';

export interface Tenant {
    id: number;
    name: string;
    schema_name: string;
    created_at?: string;
    updated_at?: string;
}

export interface Domain {
    id: number;
    domain: string;
    tenant: number;
    is_primary: boolean;
    created_at?: string;
}

export interface TenantDomainResponse {
    tenant_domain: string | null;
    is_master: boolean;
    available_domains?: string[];
}

export interface ProvisionTenantRequest {
    name: string;
    schema_name: string;
    domain: string;
    admin_name: string;
    admin_email: string;
    admin_password?: string;
}

export interface ProvisionTenantResponse {
    tenant: Tenant;
    admin: {
        id: number;
        name: string;
        email: string;
    };
    email_queued: boolean;
    created: {
        tenant: boolean;
        domain: boolean;
        admin: boolean;
    };
}

// Get tenant domain for current user
export const getTenantDomain = async (): Promise<TenantDomainResponse> => {
    const response = await api.get('/api/v1/auth/tenant-domain/');
    return response.data;
};

// Get list of tenants (master only)
export const getListTenants = async (): Promise<Tenant[]> => {
    const response = await api.get('/api/v1/tenants/');
    return response.data;
};

// Get detail tenant (master only)
export const getDetailTenant = async (id: number): Promise<Tenant> => {
    const response = await api.get(`/api/v1/tenants/${id}/`);
    return response.data;
};

// Create tenant (master only)
export const createTenant = async (data: Partial<Tenant>): Promise<Tenant> => {
    const response = await api.post('/api/v1/tenants/', data);
    return response.data;
};

// Update tenant (master only)
export const updateTenant = async (id: number, data: Partial<Tenant>): Promise<Tenant> => {
    const response = await api.patch(`/api/v1/tenants/${id}/`, data);
    return response.data;
};

// Delete tenant (master only)
export const deleteTenant = async (id: number): Promise<void> => {
    await api.delete(`/api/v1/tenants/${id}/`);
};

// Provision tenant (master only) - creates tenant, domain, and org admin
export const provisionTenant = async (data: ProvisionTenantRequest): Promise<ProvisionTenantResponse> => {
    const response = await api.post('/api/v1/tenants/provision/', data);
    return response.data;
};

// Activate account
export const activateAccount = async (token: string): Promise<{ activated: boolean }> => {
    const response = await api.get('/api/v1/auth/activate/', {
        params: { token }
    });
    return response.data;
};

