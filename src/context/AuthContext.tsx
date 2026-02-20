import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserRole } from '../types';
import { login as apiLogin, logout as apiLogout, getMe, type AuthUser } from '../api/auth';

interface AuthContextType {
    user: AuthUser | null;
    role: UserRole | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isDirector: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // On mount: try to restore session from stored JWT
    useEffect(() => {
        const token = localStorage.getItem('atfitk_token');
        if (token) {
            getMe()
                .then((u) => setUser(u))
                .catch(() => {
                    // Token invalid/expired — clear it
                    localStorage.removeItem('atfitk_token');
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (username: string, password: string): Promise<boolean> => {
        try {
            const u = await apiLogin(username, password);
            setUser(u);
            return true;
        } catch {
            return false;
        }
    }, []);

    const logout = useCallback(() => {
        apiLogout();
        setUser(null);
    }, []);

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', background: 'var(--bg-main, #0f172a)', color: '#fff'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                    <div>Загрузка...</div>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                role: user?.role ?? null,
                login,
                logout,
                isDirector: user?.role === 'director',
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
