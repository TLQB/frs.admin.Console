"use client";
import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, UserInfo } from '@/hooks/useAuth';

interface AuthContextType {
    userInfo: UserInfo | null;
    isLoading: boolean;
    refreshUserInfo: () => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuth();

    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};

