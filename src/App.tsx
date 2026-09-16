// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ClientPurchasesPage from './pages/ClientPurchasesPage';
import ContactAdvisorPage from './pages/ContactAdvisorPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPageV2 from './pages/CheckoutPageV2';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';

const AppContent = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-minimal-beige flex items-center justify-center">
        <div className="animate-pulse text-sm font-black uppercase tracking-widest text-gray-400">
          Cargando sesión...
        </div>
      </div>
    );
  }

  const fallbackPath = isAuthenticated && user?.role === 'admin' ? '/admin/dashboard' : '/';

  return (
    <div className="min-h-screen bg-minimal-beige flex flex-col">
      <div className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              isAuthenticated && user?.role === 'admin' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <HomePage />
              )
            }
          />

          <Route path="/categoria/:categoryName" element={<HomePage />} />
          <Route path="/ofertas" element={<HomePage />} />
          <Route path="/novedades" element={<HomePage />} />
          <Route path="/catalogo" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/producto/:productId" element={<ProductDetailPage />} />

          {/* El checkout queda disponible para invitados. La cuenta se crea después del pago. */}
          <Route path="/checkout" element={<CheckoutPageV2 />} />

          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/profile/purchases"
            element={
              isAuthenticated ? (
                <ClientPurchasesPage />
              ) : (
                <Navigate to="/login" replace state={{ from: '/profile/purchases' }} />
              )
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/contact-advisor" element={<ContactAdvisorPage />} />
          <Route path="*" element={<Navigate to={fallbackPath} replace />} />
        </Routes>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ScrollToTop />
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
