import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/utils/ScrollToTop';
import PrivateRoute from './components/utils/PrivateRoute';
import Home from './pages/Home';
import Lawyers from './pages/Lawyers';
import NewsPage from './pages/News';
import About from './pages/About';
import Contact from './pages/Contact';
import ChatPage from './pages/Chat';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ConstitutionPage from './pages/ConstitutionPage';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

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
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:id" element={<NewsPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/constitution" element={<ConstitutionPage />} />
          <Route path="/chat/:type?/:id?" element={<ChatPage />} />

          {/* Auth */}
          <Route path="/auth" element={<Auth />} />

          {/* User dashboard */}
          <Route
            path="/dashboard"
            element={(
              <PrivateRoute>
                <Dashboard />
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
