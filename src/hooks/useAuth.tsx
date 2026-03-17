import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    toggleFavorite: (property: any) => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        const storedFavs = localStorage.getItem('favorites');

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }

        if (storedFavs) {
            try {
                setFavorites(JSON.parse(storedFavs));
            } catch (e) {
                console.error("Failed to parse stored favorites", e);
                localStorage.removeItem('favorites');
            }
        }

        setLoading(false);
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
        <AuthContext.Provider value={{ user, loading, favorites, login, logout, toggleFavorite, isAuthenticated: !!user }}>
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
