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
                <Route path="/constitution" element={<ConstitutionPage />} />
                <Route path="/chat/:type?/:id?" element={<ChatPage />} />

                {/* Auth sahifasi — kirgan bo'lsa dashboard ga o'tadi */}
                <Route path="/auth" element={<Auth />} />

                {/* Himoyalangan sahifalar — faqat login bo'lganlar uchun */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />

                {/* Noma'lum URL → bosh sahifa */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <ThemeSwitcher />
        </Router>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
