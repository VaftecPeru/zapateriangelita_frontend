import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    favorites: any[];
    login: (userData: User, token: string) => void;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
    toggleFavorite: (property: any) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const restoreSession = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const storedFavs = localStorage.getItem('favorites');

            if (storedFavs) {
                try {
                    setFavorites(JSON.parse(storedFavs));
                } catch (e) {
                    console.error('Failed to parse stored favorites', e);
                    localStorage.removeItem('favorites');
                }
            }

            if (!token || !storedUser) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (!cancelled) {
                    setUser(null);
                    setLoading(false);
                }
                return;
            }

            try {
                // Validar la sesión contra el backend antes de habilitar rutas protegidas.
                const response = await authService.getProfile();
                const profile = (response.data as any)?.user ?? response.data;

                if (!profile?.id || !profile?.email) {
                    throw new Error('Perfil de usuario inválido');
                }

                localStorage.setItem('user', JSON.stringify(profile));

                if (!cancelled) {
                    setUser(profile as User);
                }
            } catch (error) {
                console.warn('La sesión guardada ya no es válida o no pudo verificarse.', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');

                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        restoreSession();

        return () => {
            cancelled = true;
        };
    }, []);

    const login = (userData: User, token: string) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('favorites');
        setUser(null);
        setFavorites([]);
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
        <AuthContext.Provider value={{ user, loading, favorites, login, logout, updateUser, toggleFavorite, isAuthenticated: !!user }}>
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
