// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChangeTemporaryPasswordPage from './pages/ChangeTemporaryPasswordPage';
import RegisterPage from './pages/RegisterPage';
import WelcomeDashboardPage from './pages/WelcomeDashboardPage';
import ProfilePage from './pages/ProfilePage';
import ClientPurchasesPage from './pages/ClientPurchasesPage';
import ContactAdvisorPage from './pages/ContactAdvisorPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPageV2 from './pages/CheckoutPageV2';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import LoadingScreen from './components/LoadingScreen';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';
import './styles/product-detail-mobile.css';
import './styles/product-detail-premium.css';

const AppContent = () => {
  const { user, isAuthenticated, loading, sessionError, retrySession } = useAuth();

  if (loading) {
    return <LoadingScreen label="Cargando sesión" />;
  }

  if (sessionError) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p role="alert">{sessionError}</p>
        <button type="button" onClick={() => void retrySession()} className="rounded-xl bg-black px-6 py-3 text-white">
          Reintentar conexión
        </button>
      </main>
    );
  }

  const isAdminUser = isAuthenticated && ['admin', 'superadmin'].includes(String(user?.role || ''));
  const fallbackPath = isAdminUser ? '/admin/dashboard' : '/';

  if (isAuthenticated && user?.must_change_password && window.location.pathname !== '/change-temporary-password') {
    return <Navigate to="/change-temporary-password" replace />;
  }

  return (
    <div className="min-h-screen bg-minimal-beige flex flex-col">
      <div className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              isAdminUser ? (
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
          <Route path="/change-temporary-password" element={isAuthenticated ? <ChangeTemporaryPasswordPage /> : <Navigate to="/login" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/welcome" element={<WelcomeDashboardPage />} />
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

