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
    discounted_price?: number;
    rating?: number;
    reviews?: number;
    img: string;
    images?: string[];
    amenities?: string;
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
    tag?: string;
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
        services: number;
        rooms?: number;
    };
    charts: {
        monthlyRevenue: number[];
        monthlyLabels: string[];
        benefitsDistribution: {
            total: number;
            costs: number;
            taxes: number;
            maintenance: number;
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

export interface Lead {
    id?: number;
    type: string;
    item_id: number;
    first_name?: string;
    last_name?: string;
    phone?: string;
    check_in?: string;
    check_out?: string;
    guests?: number;
    property_title?: string;
    created_at?: string;
    is_read?: boolean;
}

export const leadService = {
    trackLead: (type: 'property' | 'service', itemId: number, contactData?: {
        first_name?: string;
        last_name?: string;
        phone?: string;
        check_in?: string;
        check_out?: string;
        guests?: number;
        property_title?: string;
    }) => apiClient.post('/leads', { type, item_id: itemId, ...contactData }),
    getAll: () => apiClient.get<Lead[]>('/leads'),
    update: (id: number, data: Partial<Lead>) => apiClient.put<Lead>(`/leads/${id}`, data),
    delete: (id: number) => apiClient.delete(`/leads/${id}`),
};


