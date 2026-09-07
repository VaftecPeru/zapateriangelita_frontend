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

export const authService = {
    login: (data: LoginData) => apiClient.post('/login', data),
    register: (data: RegisterData) => apiClient.post('/register', data),
    logout: () => apiClient.post('/logout'),
    getProfile: () => apiClient.get('/user'),
};