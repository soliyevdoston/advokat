import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollToTop from './components/utils/ScrollToTop';
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
                <Route path="/" element={<Home />} />
                <Route path="/lawyers" element={<Lawyers />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/news/:id" element={<NewsPage />} />
                <Route path="/chat/:type?/:id?" element={<ChatPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/constitution" element={<ConstitutionPage />} />
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
