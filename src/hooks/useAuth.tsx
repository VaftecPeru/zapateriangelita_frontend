import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
    must_change_password?: boolean;
    temporary_password_set_at?: string | null;
    phone?: string;
    google_email?: string | null;
    google_linked_at?: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    sessionError: string | null;
    retrySession: () => Promise<void>;
    favorites: any[];
    login: (userData: User, token: string) => void;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<User>) => void;
    toggleFavorite: (property: any) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [sessionError, setSessionError] = useState<string | null>(null);
    const sessionVersion = useRef(0);

    const restoreSession = useCallback(async () => {
        const version = ++sessionVersion.current;
        const token = localStorage.getItem('token');
        const isCurrent = () => version === sessionVersion.current && localStorage.getItem('token') === token;
        setLoading(true);
        setSessionError(null);

        if (!token) {
            localStorage.removeItem('user');
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await authService.getProfile();
            if (!isCurrent()) return;
            const profile = response.data?.user ?? response.data;
            if (!profile?.id || !profile?.email) throw new Error('Perfil de usuario inválido');
            localStorage.setItem('user', JSON.stringify(profile));
            setUser(profile as User);
        } catch (error: any) {
            if (!isCurrent()) return;
            setUser(null);
            if (error.response?.status === 401) {
                // Solo una sesión rechazada por el servidor debe eliminarse.
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            } else {
                // No habilitar rutas privadas con datos locales sin verificar.
                setSessionError('No pudimos verificar tu sesión. Tu acceso está guardado; vuelve a intentar.');
            }
        } finally {
            if (version === sessionVersion.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
            setFavorites(Array.isArray(stored) ? stored : []);
        } catch {
            localStorage.removeItem('favorites');
        }
        void restoreSession();
        return () => { sessionVersion.current += 1; };
    }, [restoreSession]);

    const login = (userData: User, token: string) => {
        if (!userData?.id || !userData?.email || !token?.trim()) {
            throw new Error('El servidor no devolvió una sesión válida.');
        }
        sessionVersion.current += 1;
        setSessionError(null);
        setLoading(false);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = async () => {
        const version = ++sessionVersion.current;
        try {
            if (localStorage.getItem('token')) await authService.logout();
        } catch (error) {
            console.warn('No fue posible revocar la sesión remota.', error);
        } finally {
            if (version === sessionVersion.current) {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('favorites');
                setUser(null);
                setFavorites([]);
                setSessionError(null);
                setLoading(false);
            }
        }
    };

    const updateUser = (updatedData: Partial<User>) => {
        setUser(prev => {
            if (!prev) return prev;
            const newUser = { ...prev, ...updatedData };
            localStorage.setItem('user', JSON.stringify(newUser));
            return newUser;
        });
    };

    const toggleFavorite = (property: any) => {
        setFavorites(prev => {
            const isFavorite = prev.some(p => p.id === property.id);
            let newFavs;
            if (isFavorite) {
                newFavs = prev.filter(p => p.id !== property.id);
            } else {
                newFavs = [...prev, property];
            }
            localStorage.setItem('favorites', JSON.stringify(newFavs));
            return newFavs;
        });
    };

    return (
        <AuthContext.Provider value={{ user, loading, sessionError, retrySession: restoreSession, favorites, login, logout, updateUser, toggleFavorite, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

