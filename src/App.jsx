import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/utils/ScrollToTop';
import PrivateRoute from './components/utils/PrivateRoute';
import Home from './pages/Home';
import Lawyers from './pages/Lawyers';
import ServiceDetail from './pages/ServiceDetail';
import NewsPage from './pages/News';
import Contact from './pages/Contact';
import About from './pages/About';
import ChatPage from './pages/Chat';
import CaseNavigatorPage from './pages/CaseNavigator';
import Auth from './pages/Auth';
import GoogleCallback from './pages/GoogleCallback';
import Dashboard from './pages/Dashboard';
import LawyerDashboard from './pages/LawyerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import ConstitutionPage from './pages/ConstitutionPage';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { useAuth } from './context/AuthContext';

import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import ThemeSwitcher from './components/layout/ThemeSwitcher';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-grow">
        <Routes>
          {/* Ochiq sahifalar */}
          <Route path="/" element={<Home />} />
          <Route path="/lawyers" element={<Lawyers />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/case-navigator" element={<CaseNavigatorPage />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/constitution" element={<ConstitutionPage />} />
          <Route path="/chat/:type?/:id?" element={<ChatPage />} />

          {/* Auth */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
          <Route path="/user/auth/login-gugl" element={<GoogleCallback />} />

          {/* User dashboard */}
          <Route
            path="/dashboard"
            element={(
              <PrivateRoute>
                <RoleDashboard />
              </PrivateRoute>
            )}
          />

          <Route
            path="/lawyer"
            element={(
              <PrivateRoute requireRole="lawyer" unauthorizedTo="/dashboard">
                <LawyerDashboard />
              </PrivateRoute>
            )}
          />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={(
              <PrivateRoute requireRole="admin" unauthorizedTo="/dashboard">
                <AdminDashboard />
              </PrivateRoute>
            )}
          />

          {/* Noma'lum URL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      <ThemeSwitcher position="bottom-right" />
    </div>
  );
}

export default App;

function RoleDashboard() {
  const { user } = useAuth();

  if (user?.role === 'lawyer') {
    return <Navigate to="/lawyer" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <Dashboard />;
}
