import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import Logo from '../ui/Logo';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="bg-[var(--color-surface-950)] text-slate-300 border-t border-slate-800">
      <div className="section-wrap py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 text-white">
              <span className="w-10 h-10 rounded-xl bg-white/10 inline-flex items-center justify-center">
                <Logo className="w-7 h-7" color="text-white" />
              </span>
              <span className="text-2xl font-serif font-bold">LegalLink</span>
            </Link>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              {t('footer.desc')}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <SocialLink href="https://www.instagram.com/legallinkuz/" icon={<Instagram size={16} />} label="Instagram" />
              <SocialLink href="https://www.facebook.com/legallink.uz" icon={<Facebook size={16} />} label="Facebook" />
              <SocialLink href="https://x.com/etonemativich?s=21" icon={<Twitter size={16} />} label="X" />
            </div>
          </div>

          <div>
            <FooterTitle>{t('footer.links')}</FooterTitle>
            <FooterList>
              <FooterItem to="/">{t('nav.home')}</FooterItem>
              <FooterItem to="/about">Biz haqimizda</FooterItem>
              <FooterItem to="/lawyers">{t('nav.lawyers')}</FooterItem>
              <FooterItem to="/chat/ai">{t('services.items.consultation.title')}</FooterItem>
              <FooterItem to="/chat/document">Hujjat shablonlari</FooterItem>
            </FooterList>
          </div>

          <div>
            <FooterTitle>{t('footer.services')}</FooterTitle>
            <FooterList>
              <FooterItem to="/chat/ai">AI konsultatsiya</FooterItem>
              <FooterItem to="/chat/document">Hujjat tayyorlash</FooterItem>
              <FooterItem to="/chat/lawyer">Advokatga murojaat</FooterItem>
              <FooterItem to="/constitution">Konstitutsiya bo`limi</FooterItem>
            </FooterList>
          </div>

          <div>
            <FooterTitle>{t('footer.contact')}</FooterTitle>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[var(--color-secondary)] mt-0.5" />
                <span>{t('footer.address')}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="text-[var(--color-secondary)]" />
                <a href="tel:1144" className="hover:text-white">1144</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="text-[var(--color-secondary)]" />
                <a href="mailto:info@advokat.uz" className="hover:text-white">info@advokat.uz</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {currentYear} {t('footer.rights')}</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-300">{t('footer.privacy')}</Link>
            <Link to="/terms" className="hover:text-slate-300">{t('footer.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterTitle({ children }) {
  return <h3 className="text-white text-base font-semibold mb-4">{children}</h3>;
}

function FooterList({ children }) {
  return <ul className="space-y-2.5 text-sm text-slate-400">{children}</ul>;
}

function FooterItem({ children, to }) {
  return (
    <li>
      <Link to={to} className="hover:text-white">
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-8 h-8 rounded-lg inline-flex items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
    >
      {icon}
    </a>
  );
}
