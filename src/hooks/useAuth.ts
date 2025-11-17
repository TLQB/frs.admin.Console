import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface JWTClaims {
    name?: string;
    email?: string;
    global_role?: string;
    roles?: string[];
    tenant_domain?: string;
    exp?: number;
    iat?: number;
}

interface UserInfo {
    name?: string;
    email?: string;
    global_role?: string;
    roles: string[];
    isMaster: boolean;
    isOrgAdmin: boolean;
    isEmployee: boolean;
    tenant_domain?: string;
}

export const useAuth = () => {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = Cookies.get('access_token');
        if (token) {
            try {
                const decoded = jwtDecode<JWTClaims>(token);
                const roles = decoded.roles || [];
                
                // Normalize roles to lowercase for comparison
                const normalizedRoles = roles.map(r => typeof r === 'string' ? r.toLowerCase() : String(r).toLowerCase());
                
                const user: UserInfo = {
                    name: decoded.name,
                    email: decoded.email,
                    global_role: decoded.global_role,
                    roles: normalizedRoles,
                    isMaster: normalizedRoles.includes('master') || decoded.global_role?.toUpperCase().includes('MASTER') || false,
                    isOrgAdmin: normalizedRoles.includes('org_admin') || decoded.global_role?.toUpperCase().includes('ORG_ADMIN') || false,
                    isEmployee: normalizedRoles.includes('employee') || false,
                    tenant_domain: decoded.tenant_domain,
                };
                
                // Persist minimal context for API baseURL switching
                try {
                    if (user.tenant_domain) {
                        Cookies.set('tenant_domain', user.tenant_domain);
                    } else {
                        Cookies.remove('tenant_domain');
                    }
                    Cookies.set('is_master', String(!!user.isMaster));
                } catch {}

                setUserInfo(user);
            } catch (error) {
                console.error('Error decoding token:', error);
                setUserInfo(null);
            }
        } else {
            setUserInfo(null);
        }
        setIsLoading(false);
    }, []);

    const refreshUserInfo = () => {
        const token = Cookies.get('access_token');
        if (token) {
            try {
                const decoded = jwtDecode<JWTClaims>(token);
                const roles = decoded.roles || [];
                
                // Normalize roles to lowercase for comparison
                const normalizedRoles = roles.map(r => typeof r === 'string' ? r.toLowerCase() : String(r).toLowerCase());
                
                const user: UserInfo = {
                    name: decoded.name,
                    email: decoded.email,
                    global_role: decoded.global_role,
                    roles: normalizedRoles,
                    isMaster: normalizedRoles.includes('master') || decoded.global_role?.toUpperCase().includes('MASTER') || false,
                    isOrgAdmin: normalizedRoles.includes('org_admin') || decoded.global_role?.toUpperCase().includes('ORG_ADMIN') || false,
                    isEmployee: normalizedRoles.includes('employee') || false,
                    tenant_domain: decoded.tenant_domain,
                };
                try {
                    if (user.tenant_domain) {
                        Cookies.set('tenant_domain', user.tenant_domain);
                    } else {
                        Cookies.remove('tenant_domain');
                    }
                    Cookies.set('is_master', String(!!user.isMaster));
                } catch {}

                setUserInfo(user);
            } catch (error) {
                console.error('Error decoding token:', error);
                setUserInfo(null);
            }
        } else {
            setUserInfo(null);
        }
    };

    const logout = () => {
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        Cookies.remove('tenant_domain');
        Cookies.remove('is_master');
        setUserInfo(null);
        if (typeof window !== 'undefined') {
            window.location.href = '/signin';
        }
    };

    return {
        userInfo,
        isLoading,
        refreshUserInfo,
        logout,
        isAuthenticated: !!userInfo,
    };
};

