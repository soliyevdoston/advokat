import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import flagUz from '../../assets/flags/uz.svg';
import flagOz from '../../assets/flags/oz.svg';
import flagRu from '../../assets/flags/ru.svg';
import flagEn from '../../assets/flags/en.svg';

const languageFlags = {
  uz: flagUz,
  oz: flagOz,
  ru: flagRu,
  en: flagEn,
};

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const { currentLanguage, changeLanguage, languages, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname === '/';
  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'lawyer' ? '/lawyer' : '/dashboard';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const shellClass = useMemo(() => {
    if (isHome && !scrolled) return 'bg-transparent py-5';
    return 'bg-white/92 dark:bg-slate-900/92 border-b border-slate-200/70 dark:border-slate-700/80 backdrop-blur-md shadow-sm py-3';
  }, [isHome, scrolled]);

  const linkClass = (active) => {
    if (isHome && !scrolled) {
      return active ? 'text-white' : 'text-white/85 hover:text-white';
    }

    return active
      ? 'text-[var(--color-primary)] dark:text-blue-300'
      : 'text-slate-600 dark:text-slate-300 hover:text-[var(--color-primary)] dark:hover:text-white';
  };

  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: 'Biz haqimizda', path: '/about' },
    { name: t('nav.lawyers'), path: '/lawyers' },
    { name: 'Chat', path: '/chat/ai' },
  ];

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${shellClass}`}>
      <div className="section-wrap">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${
              isHome && !scrolled ? 'bg-white/10' : 'bg-[var(--color-primary)]/10 dark:bg-slate-800'
            }`}>
              <Logo className="w-7 h-7" color={isHome && !scrolled ? 'text-white' : 'text-[var(--color-primary)] dark:text-white'} />
            </span>
            <span className={`text-xl font-serif font-bold ${isHome && !scrolled ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              LegalLink
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-semibold transition-colors ${linkClass(location.pathname === item.path)}`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSelect
              currentLanguage={currentLanguage}
              changeLanguage={changeLanguage}
              languages={languages}
              darkOnHero={isHome && !scrolled}
            />

            {user ? (
              <Link to={dashboardPath}>
                <Button variant="outline" className="gap-2 px-4">
                  <User size={16} />
                  {t('nav.dashboard')}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" className={isHome && !scrolled ? 'text-white hover:bg-white/10 hover:text-white' : ''}>
                    {t('nav.login')}
                  </Button>
                </Link>
                <Link to="/auth" state={{ isLogin: false }}>
                  <Button className={isHome && !scrolled ? 'bg-white text-[var(--color-primary)] hover:bg-slate-100' : ''}>
                    {t('nav.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSelect
              currentLanguage={currentLanguage}
              changeLanguage={changeLanguage}
              languages={languages}
              compact
              darkOnHero={isHome && !scrolled}
            />
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border ${
                isHome && !scrolled
                  ? 'border-white/30 text-white bg-white/10'
                  : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800'
              }`}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="section-wrap py-4 space-y-2">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  location.pathname === item.path
                    ? 'bg-[var(--color-primary-50)] text-[var(--color-primary)] dark:bg-slate-800 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-2 grid grid-cols-2 gap-2">
              {user ? (
                <Link to={dashboardPath} className="col-span-2" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full justify-center gap-2">
                    <User size={16} />
                    {t('nav.dashboard')}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      {t('nav.login')}
                    </Button>
                  </Link>
                  <Link to="/auth" state={{ isLogin: false }} onClick={() => setMobileOpen(false)}>
                    <Button className="w-full justify-center">{t('nav.register')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function LanguageSelect({
  currentLanguage,
  changeLanguage,
  languages,
  compact = false,
  darkOnHero = false,
}) {
  return (
    <div className="relative">
      <img
        src={languageFlags[currentLanguage] || flagUz}
        alt={`${currentLanguage} flag`}
        className={`absolute left-2.5 top-1/2 -translate-y-1/2 object-cover rounded-sm pointer-events-none border ${
          compact ? 'w-4 h-3' : 'w-5 h-4'
        } ${darkOnHero ? 'border-white/40' : 'border-slate-300 dark:border-slate-600'}`}
      />
      <select
        value={currentLanguage}
        onChange={(event) => changeLanguage(event.target.value)}
        className={`appearance-none rounded-lg border text-xs font-semibold focus:outline-none ${
          compact ? 'py-2 pl-7 pr-6' : 'py-2.5 pl-9 pr-7'
        } ${
          darkOnHero
            ? 'bg-white/10 border-white/30 text-white'
            : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200'
        }`}
      >
        {languages.map((lang) => (
          <option
            key={lang.code}
            value={lang.code}
            className="text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
          >
            {compact ? lang.code.toUpperCase() : lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
