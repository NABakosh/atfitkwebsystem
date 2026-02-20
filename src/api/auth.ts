import { api, setToken, removeToken } from './client';

export interface AuthUser {
    id: number;
    username: string;
    role: 'director' | 'psychologist';
    displayName: string;
}

interface LoginResponse {
    token: string;
    user: AuthUser;
}

export async function login(username: string, password: string): Promise<AuthUser> {
    const data = await api.post<LoginResponse>('/api/auth/login', { username, password });
    setToken(data.token);
    return data.user;
}

export async function getMe(): Promise<AuthUser> {
    const data = await api.get<{ user: AuthUser }>('/api/auth/me');
    return data.user;
}

export function logout(): void {
    removeToken();
}
