import apiClient from './apiClient';

export interface Category {
    id?: number;
    name: string;
    slug?: string;
    icon?: string;
    image?: string;
    description?: string;
    order?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}



export interface Subcategory {
    id?: number;
    category_id: number;
    name: string;
    talla?: string;
    order?: number;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}



export interface Brand {
    id?: number;
    name: string;
    slug?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Product {
    id?: number;
    product_code?: string;
    name: string;
    category?: string | { id?: number; name: string; slug?: string };
    category_id?: number;
    subcategory_id?: number;
    brand_id?: number;
    brand?: string | { id?: number; name: string; slug?: string };
    price: number;
    discounted_price?: number;
    stock: number;
    size: string;
    color: string;
    material: string;
    img: string;
    images?: string[];
    color_images?: Record<string, string[]>;
    description?: string;
    rating: number;
    reviews: number;
    discount?: string;
    status?: 'normal' | 'oferta' | 'nuevo';
    sizes?: Array<{ id?: number; size: string; stock: number }>;
    color_sizes?: Record<string, string[]>;
    colors?: Array<{ id?: number; color: string; hex?: string | null }>;
}


export interface AdditionalService {
    id?: number;
    name: string;
    description?: string;
    price: number;
    tag?: string;
}


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



export interface User {
    id: number;
    name: string;
    email: string;
    gender?: string;
    birthdate?: string;
    role: string;
    created_at: string;
}


export interface Lead {
    id?: number;
    type: string;
    item_id: number;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    check_in?: string;
    check_out?: string;
    guests?: number;
    product_interest?: string;
    shoe_size?: string;
    contact_preference?: string;
    message?: string;
    property_title?: string;
    additional_services?: any[];
    created_at?: string;
    is_read?: boolean;
}

export interface Order {
    id: number;
    code: string;
    status: string;
    total: number | string;
    customer_name?: string;
    customer_email?: string;
    shipping_phone?: string;
    created_at?: string;
    user?: { id: number; name: string; email: string; phone?: string };
    items?: Array<{ product_name?: string; quantity: number }>;
}



export const categoryService = {
    getAll: () => apiClient.get<Category[]>('/categories'),
    getById: (id: number) => apiClient.get<Category>(`/categories/${id}`),
    getPublic: () => apiClient.get<Category[]>('/public/categories'),
    create: (data: Category) => apiClient.post<Category>('/categories', data),
    update: (id: number, data: Partial<Category>) => apiClient.put<Category>(`/categories/${id}`, data),
    delete: (id: number) => apiClient.delete(`/categories/${id}`),
};


export const subcategoryService = {
    getAll: () => apiClient.get<Subcategory[]>('/subcategories'),
    getById: (id: number) => apiClient.get<Subcategory>(`/subcategories/${id}`),
    getByCategory: (categoryId: number) => apiClient.get<Subcategory[]>(`/subcategories?category_id=${categoryId}`),
    getPublic: (categoryId?: number) => {
        const url = categoryId ? `/public/subcategories?category_id=${categoryId}` : '/public/subcategories';
        return apiClient.get<Subcategory[]>(url);
    },
    create: (data: Subcategory) => apiClient.post<Subcategory>('/subcategories', data),
    update: (id: number, data: Partial<Subcategory>) => apiClient.put<Subcategory>(`/subcategories/${id}`, data),
    delete: (id: number) => apiClient.delete(`/subcategories/${id}`),
};


export const brandService = {
    getAll: () => apiClient.get<Brand[]>('/brands'),
    getById: (id: number) => apiClient.get<Brand>(`/brands/${id}`),
    create: (data: Brand) => apiClient.post<Brand>('/brands', data),
    update: (id: number, data: Partial<Brand>) => apiClient.put<Brand>(`/brands/${id}`, data),
    delete: (id: number) => apiClient.delete(`/brands/${id}`),
};

export const productService = {
    getAll: () => apiClient.get<Product[]>('/products'),
    getById: (id: number) => apiClient.get<Product>(`/products/${id}`),
    create: (data: Product | FormData) => apiClient.post<Product>('/products', data),
    update: (id: number, data: Partial<Product> | FormData) => {
        if (data instanceof FormData) {
            data.append('_method', 'PUT');
            return apiClient.post<Product>(`/products/${id}`, data);
        }
        return apiClient.put<Product>(`/products/${id}`, data);
    },
    delete: (id: number) => apiClient.delete(`/products/${id}`),
};



export const additionalServiceService = {
    getAll: () => apiClient.get<AdditionalService[]>('/services'),
    getById: (id: number) => apiClient.get<AdditionalService>(`/services/${id}`),
    create: (data: AdditionalService) => apiClient.post<AdditionalService>('/services', data),
    update: (id: number, data: Partial<AdditionalService>) => apiClient.put<AdditionalService>(`/services/${id}`, data),
    delete: (id: number) => apiClient.delete(`/services/${id}`),
};



export const statsService = {
    getStats: () => apiClient.get<DashboardStats>('/stats'),
};



export const settingsService = {
    getAll: () => apiClient.get<{ success: boolean; data: { [key: string]: string } }>('/settings'),
    update: (key: string, value: string) => apiClient.post(`/settings/${key}?_method=PUT`, { value }),
};



export const userService = {
    updateProfile: (data: any) => apiClient.post('/user/update', data),
    getAll: () => apiClient.get<User[]>('/users'),
    delete: (id: number) => apiClient.delete(`/users/${id}`),
};


export const leadService = {
    trackLead: (type: 'property' | 'service' | 'store', itemId: number, contactData?: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        check_in?: string;
        check_out?: string;
        guests?: number;
        property_title?: string;
        property_id?: number;
        additional_services?: any[];
        product_interest?: string;
        shoe_size?: string;
        contact_preference?: string;
        message?: string;
    }) => apiClient.post('/leads', { type, item_id: itemId, ...contactData }),
    getAll: () => apiClient.get<Lead[]>('/leads'),
    getMyBookings: () => apiClient.get<Lead[]>('/my-bookings'),
    update: (id: number, data: Partial<Lead>) => apiClient.put<Lead>(`/leads/${id}`, data),
    delete: (id: number) => apiClient.delete(`/leads/${id}`),
};



export default {
    productService,
    categoryService,
    subcategoryService,
    brandService,
    additionalServiceService,
    statsService,
    settingsService,
    userService,
    leadService,
};

export const orderService = {
    getAll: () => apiClient.get<{ data: Order[] }>('/orders'),
    getMyOrders: () => apiClient.get<Order[]>('/my-orders'),
    updateStatus: (id: number, status: string) => apiClient.put<Order>(`/orders/${id}/status`, { status }),
};