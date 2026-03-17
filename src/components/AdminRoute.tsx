import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { user, loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-minimal-beige flex items-center justify-center">
                <div className="animate-pulse text-sm font-black uppercase tracking-widest text-gray-400">
                    Verificando permisos...
                </div>
            </div>
        );
    }

    // Role check (the database query showed user 4 has role: 'admin')
    if (!isAuthenticated || (user as any)?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
