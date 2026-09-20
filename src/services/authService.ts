import apiClient from './apiClient';

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone?: string;
    gender?: string;
    birthdate?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface GoogleConfigResponse {
    enabled: boolean;
    client_id: string | null;
    status?: 'ready' | 'missing' | 'invalid';
}

export const authService = {
    login: (data: LoginData) => apiClient.post('/login', data),
    register: (data: RegisterData) => apiClient.post('/register', data),
    logout: () => apiClient.post('/logout'),
    getProfile: () => apiClient.get('/user'),
    googleConfig: () => apiClient.get<GoogleConfigResponse>('/auth/google/config', {
        params: { _ts: Date.now() },
        headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
        },
    }),
    googleLogin: (credential: string) => apiClient.post('/auth/google/login', { credential }, { timeout: 12000 }),
    googleWelcome: () => apiClient.post('/auth/google/welcome', {}, { timeout: 12000 }),
    googleLink: (credential: string) => apiClient.post('/auth/google/link', { credential }, { timeout: 12000 }),
};