import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import ContactAdvisorPage from './pages/ContactAdvisorPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import PropertiesPage from './pages/PropertiesPage';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import HowItWorksPage from './pages/HowItWorksPage';
import FloatingHowItWorks from './components/FloatingHowItWorks';
import { AuthProvider, useAuth } from './hooks/useAuth';

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <div className="min-h-screen bg-minimal-beige flex flex-col">
      {!isAdmin && <Header />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/contact-advisor" element={<ContactAdvisorPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
        </Routes>
      </div>
      {!isAdmin && <Footer />}
      {!isAdmin && <FloatingHowItWorks />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;