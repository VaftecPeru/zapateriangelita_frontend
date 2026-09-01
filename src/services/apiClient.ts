import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_URL } from '../config/api';


const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Accept': 'application/json',
    },
    withCredentials: true, 
});


apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
