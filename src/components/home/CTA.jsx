import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

export default function CTA() {
  const { t } = useLanguage();

  return (
    <section className="py-14 md:py-20">
      <div className="section-wrap">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-[var(--color-primary)] via-[#205d99] to-[#1f4b7c] p-7 md:p-12">
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-white/15 blur-3xl" />
          <div className="absolute -bottom-28 -left-24 w-80 h-80 rounded-full bg-[var(--color-secondary)]/30 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight">
              {t('cta.title')}
            </h2>
            <p className="mt-4 text-blue-100 text-lg leading-relaxed">
              {t('cta.subtitle')}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/lawyers">
                <Button className="bg-white text-[var(--color-primary)] hover:bg-slate-100 h-12 px-7">
                  {t('cta.btn_lawyers')}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="outline"
                  className="h-12 px-7 border-white/40 text-white hover:bg-white/12 dark:border-white/40 dark:text-white"
                >
                  <Phone size={16} className="mr-2" />
                  {t('cta.btn_contact')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
