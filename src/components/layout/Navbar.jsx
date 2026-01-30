import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Scale } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
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
    if (isHome && !scrolled) {
      return isActive ? 'text-blue-200' : 'text-white/90 hover:text-white';
    }
    return isActive ? 'text-[var(--color-primary)]' : 'text-slate-600 hover:text-[var(--color-primary)]';
  };

  const getLogoColor = () => {
    if (isHome && !scrolled) {
      return 'text-white';
    }
    return 'text-[var(--color-primary)]';
  };

  const getLogoBg = () => {
    if (isHome && !scrolled) {
      return 'bg-white/20 backdrop-blur-md text-white';
    }
    return 'bg-[var(--color-primary)] text-white';
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img 
              src="/logo.jpg" 
              alt="LegalLink Logo" 
              className="w-10 h-10 rounded-xl object-cover shadow-lg"
            />
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
            <Link to="/chat">
               <Button className={`${isHome && !scrolled ? 'bg-white text-[var(--color-primary)] hover:bg-blue-50' : 'btn-primary'}`}>
                 Bepul Konsultatsiya
               </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 transition-colors ${isHome && !scrolled ? 'text-white' : 'text-slate-600'}`}
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
            className="md:hidden border-t border-slate-100 bg-white shadow-xl"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`block text-lg font-medium transition-colors ${
                    location.pathname === link.path 
                      ? 'text-[var(--color-primary)]' 
                      : 'text-slate-600 hover:text-[var(--color-primary)]'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4">
                <Link to="/chat" onClick={() => setIsOpen(false)}>
                  <Button className="w-full btn-primary">Bepul Konsultatsiya</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

const navLinks = [
  { name: 'Asosiy', path: '/' },
  { name: 'Advokatlar', path: '/lawyers' },
  { name: 'Yangiliklar', path: '/news' },
  { name: 'Biz haqimizda', path: '/about' },
  { name: "Bog'lanish", path: '/contact' },
];
