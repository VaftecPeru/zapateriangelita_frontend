import apiClient from './apiClient';

export interface Property {
    id?: number;
    type: string;
    status: string;
    title: string;
    location: string;
    beds: number;
    baths: number;
    area: string;
    price: number;
    rating?: number;
    reviews?: number;
    img: string;
}

export const propertyService = {
    getAll: () => apiClient.get<Property[]>('/properties'),
    getById: (id: number) => apiClient.get<Property>(`/properties/${id}`),
    create: (data: Property | FormData) => apiClient.post<Property>('/properties', data),
    update: (id: number, data: Partial<Property> | FormData) => apiClient.post<Property>(`/properties/${id}?_method=PUT`, data),
    delete: (id: number) => apiClient.delete(`/properties/${id}`),
    trackView: (id: number) => apiClient.post(`/properties/${id}/view`),
};

export interface AdditionalService {
    id?: number;
    name: string;
    description?: string;
    price: number;
}

export const additionalServiceService = {
    getAll: () => apiClient.get<AdditionalService[]>('/services'),
    getById: (id: number) => apiClient.get<AdditionalService>(`/services/${id}`),
    create: (data: AdditionalService) => apiClient.post<AdditionalService>('/services', data),
    update: (id: number, data: Partial<AdditionalService>) => apiClient.put<AdditionalService>(`/services/${id}`, data),
    delete: (id: number) => apiClient.delete(`/services/${id}`),
};

export interface DashboardStats {
    revenue: {
        total: number;
        change: string;
        expenses: number;
        expensesChange: string;
    };
    inventory: {
        properties: number;
        rooms: number;
        services: number;
    };
    charts: {
        monthlyRevenue: number[];
        benefitsDistribution: {
            total: number;
            costs: number;
            taxes: number;
        };
    };
    recentActivity: {
        text: string;
        time: string;
    }[];
}

export const statsService = {
    getStats: () => apiClient.get<DashboardStats>('/stats'),
};

export const settingsService = {
    getAll: () => apiClient.get<{ success: boolean; data: { [key: string]: string } }>('/settings'),
    update: (key: string, value: string) => apiClient.post(`/settings/${key}?_method=PUT`, { value }),
};

export const leadService = {
    trackLead: (type: 'property' | 'service', itemId: number) => apiClient.post('/leads', { type, item_id: itemId }),
};

