const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getToken(): string | null {
    return localStorage.getItem('atfitk_token');
}

export function setToken(token: string): void {
    localStorage.setItem('atfitk_token', token);
}

export function removeToken(): void {
    localStorage.removeItem('atfitk_token');
}

interface RequestOptions {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP ${response.status}`);
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string) => request<T>(endpoint),
    post: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'POST', body }),
    put: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: 'PUT', body }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),

    // File upload (multipart/form-data)
    uploadFile: async <T>(endpoint: string, formData: FormData): Promise<T> => {
        const token = getToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ error: 'Upload failed' }));
            throw new Error(err.error || `HTTP ${response.status}`);
        }

        return response.json();
    },
};

export { BASE_URL };
