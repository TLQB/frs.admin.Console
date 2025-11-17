import axios from 'axios';
import Cookies from 'js-cookie';
import { checkRefreshToken } from './admins';
import { jwtDecode } from 'jwt-decode';

// Base public URL (backend public domain)
const PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const DEBUG_TENANT_ROUTING = process.env.NODE_ENV !== 'production';

const extractPortFromUrl = (url: string): string | null => {
    try {
        const u = new URL(url);
        if (u.port) return u.port;
        // Default ports by protocol
        return u.protocol === 'https:' ? '443' : '8080';
    } catch {
        return '8080';
    }
};

const ensurePortOnDomain = (domain: string | null | undefined, fallbackPort: string): string | null => {
    if (!domain) return null;
    // If domain already contains port, return as-is
    if (/:[0-9]+$/.test(domain)) return domain;
    // If domain is localhost-like or dev subdomain without port, append fallback port
    const host = domain.split('/')[0];
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.localhost');
    if (isLocal && fallbackPort) return `${domain}:${fallbackPort}`;
    return domain; // leave unchanged for real domains where port 80/443 likely works
};

// Initialize Axios instance
const api = axios.create({
    baseURL: PUBLIC_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Queue of requests paused while refreshing token
let refreshQueue: Array<(token: string) => void> = [];
let isRefreshing = false;

// Cache tenant domain resolution to avoid duplicate calls
let tenantDomainResolved = false;
let tenantDomainPromise: Promise<string | null> | null = null;

const resolveTenantDomain = async (token: string): Promise<string | null> => {
    if (tenantDomainResolved && Cookies.get('tenant_domain')) {
        return Cookies.get('tenant_domain') || null;
    }
    if (!tenantDomainPromise) {
        // Call public endpoint to retrieve tenant domain (no interceptor to avoid recursion)
        const raw = axios.create({ baseURL: PUBLIC_BASE_URL });
        if (DEBUG_TENANT_ROUTING) console.log('[API] Resolving tenant domain via /auth/tenant-domain ...');
        tenantDomainPromise = raw
            .get('/api/v1/auth/tenant-domain/', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const data = res.data || {};
                const domainVal: string = (data?.tenant_domain ?? '') as string;
                const isMasterFlag = !!data?.is_master;
                if (domainVal) Cookies.set('tenant_domain', String(domainVal));
                Cookies.set('is_master', String(isMasterFlag));
                tenantDomainResolved = true;
                if (DEBUG_TENANT_ROUTING) console.log('[API] Resolved tenant_domain =', domainVal, 'is_master =', isMasterFlag);
                return domainVal || null;
            })
            .catch((err) => {
                if (DEBUG_TENANT_ROUTING) console.error('[API] Failed to resolve tenant domain:', err);
                return null;
            })
            .finally(() => {
                tenantDomainPromise = null;
            });
    }
    return tenantDomainPromise;
};

// Request Interceptor: Add access token to header
api.interceptors.request.use(
    async (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Dynamic baseURL switching for tenant domain when not master
        try {
            const urlStr = String(config.url || '');
            const isAbsoluteUrl = /^https?:\/\//i.test(urlStr);
            const isAuthEndpoint = urlStr.startsWith('/api/v1/auth/') || urlStr.includes('/api/v1/auth/');
            let tenantDomain: string | null | undefined = Cookies.get('tenant_domain');
            let isMasterCookie = Cookies.get('is_master');
            // IMPORTANT: Convert cookie to boolean, default is false
            let isMaster = isMasterCookie === 'true';
            
            // Fallback: decode token to get tenant_domain/roles if cookies not set yet
            if (!isAuthEndpoint && token) {
                const decoded: any = jwtDecode(token);
                if (decoded) {
                    // Get roles array
                    const roles: string[] = (decoded.roles || []).map((r: any) => String(r).toLowerCase());
                    const globalRole = String(decoded.global_role || '').toUpperCase();
                    
                    if (DEBUG_TENANT_ROUTING) {
                        console.log('[API] JWT decoded - roles:', roles, 'global_role:', globalRole, 'tenant_domain:', decoded.tenant_domain);
                    }
                    
                    // Determine user type accurately
                    const isMasterUser = globalRole === 'MASTER' || globalRole === 'MASTER_ADMIN';
                    const isOrgUser = roles.includes('org_admin') || 
                                     roles.includes('employee') || 
                                     globalRole === 'ORG_ADMIN';
                    
                    // If cookie is not set or doesn't match JWT
                    if (isMasterCookie === undefined || (isMasterUser && !isMaster) || (isOrgUser && isMaster)) {
                        isMaster = isMasterUser;
                        Cookies.set('is_master', String(isMaster));
                        if (DEBUG_TENANT_ROUTING) {
                            console.log('[API] Updated is_master cookie to:', isMaster);
                        }
                    }
                    
                    // Get tenant_domain from JWT if not available
                    if (!tenantDomain && decoded.tenant_domain) {
                        tenantDomain = decoded.tenant_domain;
                        Cookies.set('tenant_domain', String(tenantDomain || ''));
                        if (DEBUG_TENANT_ROUTING) {
                            console.log('[API] Updated tenant_domain cookie to:', tenantDomain);
                        }
                    }
                    
                    // If org user but no tenant_domain, call API to get it
                    const isTenantDomainEndpoint = urlStr.includes('/api/v1/auth/tenant-domain/');
                    if (!tenantDomain && isOrgUser && !isTenantDomainEndpoint) {
                        if (DEBUG_TENANT_ROUTING) {
                            console.log('[API] Org user without tenant_domain, resolving...');
                        }
                        tenantDomain = await resolveTenantDomain(token);
                        if (tenantDomain) {
                            // Update is_master sau khi resolve tenant
                            isMaster = false;
                            Cookies.set('is_master', 'false');
                        }
                    }
                }
            }
            
            if (DEBUG_TENANT_ROUTING) {
                console.log('[API] Final routing decision - tenant_domain:', tenantDomain, 
                           'is_master:', isMaster, 
                           'isAuthEndpoint:', isAuthEndpoint, 
                           'isAbsolute:', isAbsoluteUrl);
            }
            // Normalize tenant domain - determine protocol and port based on domain type
            const backendPort: string = extractPortFromUrl(PUBLIC_BASE_URL) || '8080';
            
            // Determine baseURL
            if (!isAbsoluteUrl && !isAuthEndpoint && tenantDomain && !isMaster) {
                // Determine protocol: use https for production domains, http for localhost
                const isProductionDomain = tenantDomain && 
                    !tenantDomain.includes('localhost') && 
                    !tenantDomain.includes('127.0.0.1') &&
                    !tenantDomain.includes('.local');
                
                const protocol = isProductionDomain ? 'https:' : 
                    (typeof window !== 'undefined' ? window.location.protocol : 'http:');
                
                // Remove port from domain if it's a production domain (use default ports)
                let normalizedDomain = tenantDomain;
                if (isProductionDomain) {
                    // Remove any port from production domain (use default 443 for HTTPS, 80 for HTTP)
                    normalizedDomain = normalizedDomain.replace(/:[0-9]+$/, '');
                } else {
                    // For localhost/dev, ensure port is included
                    normalizedDomain = ensurePortOnDomain(tenantDomain, backendPort) || tenantDomain;
                }
                
                config.baseURL = `${protocol}//${normalizedDomain}`;
                if (DEBUG_TENANT_ROUTING) {
                    console.log('[API] ✅ Switched to TENANT baseURL:', config.baseURL, '→', config.url);
                }
            } else {
                config.baseURL = PUBLIC_BASE_URL;
                if (DEBUG_TENANT_ROUTING) {
                    console.log('[API] ℹ️ Using PUBLIC baseURL:', config.baseURL, '→', config.url);
                }
            }
        } catch (err) {
            if (DEBUG_TENANT_ROUTING) {
                console.error('[API] Error in request interceptor:', err);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle token refresh when token expires
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Log error for debugging
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            // Try to extract meaningful error message from HTML response (when Django returns HTML error page)
            let errorMessage = '';
            if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
                // Try to extract error message from HTML
                const match = data.match(/<pre class="exception_value">([^<]+)<\/pre>/);
                if (match) {
                    errorMessage = match[1].trim();
                } else {
                    // Try to extract from title
                    const titleMatch = data.match(/<title>([^<]+)<\/title>/);
                    if (titleMatch) {
                        errorMessage = titleMatch[1].trim();
                    }
                }
            }
            
            if (errorMessage) {
                console.error(`API Error ${status}:`, errorMessage);
            } else {
                console.error('API Error:', status, data);
            }
            
            // For 500 errors, provide helpful context
            if (status === 500) {
                console.error('⚠️ Server error (500). This usually indicates:');
                console.error('   1. Database schema issue (missing tables/migrations)');
                console.error('   2. Backend code error');
                console.error('   3. Configuration problem');
                if (errorMessage) {
                    console.error(`   Error details: ${errorMessage}`);
                }
            }
        } else if (error.request) {
            console.error('Request Error:', error.request);
            // Network error - backend might not be running
            if (error.code === 'ERR_NETWORK' || error.message?.includes('CONNECTION_REFUSED')) {
                console.error('⚠️ Backend server is not running or not accessible. Please check:');
                console.error('   1. Is the backend server running on http://localhost:8080?');
                console.error('   2. Check NEXT_PUBLIC_API_URL in .env.local file');
                console.error('   3. Verify backend server is accessible');
            }
        } else {
            console.error('Error:', error.message);
        }
        
        // Check if error has response before accessing status
        // For network errors, reject immediately
        if (!error.response) {
            return Promise.reject(error);
        }

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
                console.error('Token refresh failed:', refreshError);
                Cookies.remove('access_token');
                Cookies.remove('refresh_token');
                Cookies.remove('tenant_domain');
                Cookies.remove('is_master');
                // Reset tenant domain resolution cache
                tenantDomainResolved = false;
                tenantDomainPromise = null;
                
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