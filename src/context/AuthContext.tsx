import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { DEFAULT_USERS, getSession, setSession, clearSession, simpleHash } from '../utils/storage';

interface AuthContextType {
    user: User | null;
    role: UserRole | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
    isDirector: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(getSession);

    useEffect(() => {
        // no-op: session loaded on init
    }, []);

    const login = (username: string, password: string): boolean => {
        const hash = simpleHash(password);
        const found = DEFAULT_USERS.find(
            (u) => u.username === username && u.passwordHash === hash
        );
        if (found) {
            setUser(found);
            setSession(found);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        clearSession();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                role: user?.role ?? null,
                login,
                logout,
                isDirector: user?.role === 'director',
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
