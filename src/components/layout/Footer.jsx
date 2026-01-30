import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-surface-900)] text-slate-300 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 text-white group">
              <img 
                src="/logo.jpg" 
                alt="Advokat Logo" 
                className="w-10 h-10 rounded-xl object-cover shadow-lg group-hover:scale-110 transition-transform"
              />
              <span className="text-2xl font-serif font-bold">LegalLink</span>
            </Link>
            <p className="text-slate-400 leading-relaxed">
              O'rta Osiyo bo'ylab huquqiy muammolaringizga zamonaviy yechim. Biz sizni malakali advokatlar bilan bog'laymiz.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Facebook size={20} />} />
              <SocialIcon icon={<Twitter size={20} />} />
              <SocialIcon icon={<Instagram size={20} />} />
              <SocialIcon icon={<Linkedin size={20} />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-serif font-semibold text-lg mb-6">Tezkor havolalar</h3>
            <ul className="space-y-4">
              <FooterLink to="/">Asosiy sahifa</FooterLink>
              <FooterLink to="/about">Biz haqimizda</FooterLink>
              <FooterLink to="/lawyers">Advokatlar</FooterLink>
              <FooterLink to="/news">Yangiliklar</FooterLink>
              <FooterLink to="/chat">Konsultatsiya</FooterLink>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-serif font-semibold text-lg mb-6">Xizmatlar</h3>
            <ul className="space-y-4">
              <FooterLink to="/chat/civil">Fuqarolik huquqi</FooterLink>
              <FooterLink to="/chat/criminal">Jinoyat ishlari</FooterLink>
              <FooterLink to="/chat/family">Oila huquqi</FooterLink>
              <FooterLink to="/chat/business">Biznes huquqi</FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-serif font-semibold text-lg mb-6">Bog'lanish</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-[var(--color-secondary)] shrink-0" size={20} />
                <span>Toshkent sh., Amir Temur ko'chasi, 108-uy</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[var(--color-secondary)] shrink-0" size={20} />
                <a href="tel:+998712000000" className="hover:text-white transition-colors">+998 71 200 00 00</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[var(--color-secondary)] shrink-0" size={20} />
                <a href="mailto:info@advokat.uz" className="hover:text-white transition-colors">info@advokat.uz</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            © {currentYear} LegalLink Platformasi. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/privacy" className="hover:text-[var(--color-secondary)] transition-colors">Maxfiylik siyosati</Link>
            <Link to="/terms" className="hover:text-[var(--color-secondary)] transition-colors">Foydalanish shartlari</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }) {
  return (
    <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 text-slate-400 hover:-translate-y-1">
      {icon}
    </a>
  );
}

function FooterLink({ children, to }) {
  return (
    <li>
      <Link to={to} className="hover:text-[var(--color-secondary)] transition-colors flex items-center gap-2 group">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-secondary)] transform scale-0 group-hover:scale-100 transition-transform"></span>
        <span className="group-hover:translate-x-1 transition-transform">{children}</span>
      </Link>
    </li>
  );
}
