import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { currentLanguage, changeLanguage, languages, t } = useLanguage();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine text color based on scroll and page
  const getTextColor = (isActive) => {
    // If we're on home and not scrolled, keep it white/transparent
    // But if we're in dark mode, we essentially behave like "scrolled" but dark colors
    // Actually, on Home, if it's dark mode, the hero might still be visible. Hero is usually dark or has image.
    // If the global theme is dark, the "transparent" navbar is fine on top of dark hero.
    // But once scrolled, we need dark background.
    
    if (isHome && !scrolled) {
      return isActive ? 'text-blue-200' : 'text-white/90 hover:text-white';
    }
    return isActive ? 'text-[var(--color-primary)] dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] dark:hover:text-white';
  };

  const getLogoColor = () => {
    if (isHome && !scrolled) {
      return 'text-white';
    }
    return 'text-[var(--color-primary)] dark:text-white';
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.lawyers'), path: '/lawyers' },
    { name: t('nav.about'), path: '/about' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md py-2 border-b border-transparent dark:border-white/10' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Logo className="w-10 h-10" color={getLogoColor()} />
            <span className={`text-2xl font-serif font-bold transition-colors ${getLogoColor()}`}>
              LegalLink
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-medium transition-colors relative group ${getTextColor(location.pathname === link.path)}`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-full h-0.5 transform origin-left transition-transform duration-300 ${
                   isHome && !scrolled ? 'bg-white' : 'bg-[var(--color-secondary)]'
                } ${location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </Link>
            ))}
            
            <div className="flex items-center gap-4">
              {/* Language Switcher - Styled Select */}
              <div className="relative group">
                 <select 
                    value={currentLanguage}
                    onChange={(e) => changeLanguage(e.target.value)}
                    className={`appearance-none bg-transparent font-medium text-sm focus:outline-none cursor-pointer py-2 pl-3 pr-8 border rounded-lg transition-colors ${
                        isHome && !scrolled 
                            ? 'text-white border-white/20 hover:bg-white/10' 
                            : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                 >
                    {languages.map(lang => (
                        <option key={lang.code} value={lang.code} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">
                            {lang.flag} {lang.name}
                        </option>
                    ))}
                 </select>
                 <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${isHome && !scrolled ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                   <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                 </div>
              </div>

              {user ? (
                <Link to="/dashboard">
                  <Button variant="outline" className={`border-transparent px-4 gap-2 ${isHome && !scrolled ? 'text-white hover:bg-white/10' : 'text-[var(--color-primary)] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}>
                    <User size={20} />
                    {t('nav.dashboard')}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" className={`border-transparent px-4 ${isHome && !scrolled ? 'text-white hover:bg-white/10' : 'text-[var(--color-primary)] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'}`}>
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to="/auth" state={{ isLogin: false }}>
                     <Button className={`${isHome && !scrolled ? 'bg-white text-[var(--color-primary)] hover:bg-blue-50' : 'btn-primary'}`}>
                       {t('nav.register')}
                     </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu & Language Switcher */}
          <div className="md:hidden flex items-center gap-4">
            {/* Mobile Language Switcher (Select) */}
            <div className="relative">
              <select 
                  value={currentLanguage}
                  onChange={(e) => changeLanguage(e.target.value)}
                  className={`appearance-none bg-transparent font-bold text-xs uppercase focus:outline-none cursor-pointer py-1 pl-2 pr-6 border rounded-md ${
                      isHome && !scrolled 
                          ? 'text-white border-white/20' 
                          : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
              >
                  {languages.map(lang => (
                      <option key={lang.code} value={lang.code} className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800">
                          {lang.code}
                      </option>
                  ))}
              </select>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 transition-colors ${isHome && !scrolled ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block text-lg font-medium transition-colors ${
                    location.pathname === link.path 
                      ? 'text-[var(--color-primary)] dark:text-blue-400' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] dark:hover:text-blue-400'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 flex flex-col gap-3">
                {user ? (
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                    <Button className="w-full btn-primary justify-center gap-2">
                       <User size={20} /> {t('nav.dashboard')}
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/auth" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-center text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600">{t('nav.login')}</Button>
                    </Link>
                    <Link to="/auth" state={{ isLogin: false }} onClick={() => setIsOpen(false)}>
                      <Button className="w-full btn-primary justify-center">{t('nav.register')}</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
