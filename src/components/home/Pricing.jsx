import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

export default function Pricing() {
  const [currency, setCurrency] = useState('uzs'); // 'uzs' yoki 'usd'
  const { t } = useLanguage();

  const services = [
    {
      id: 'hire_lawyer',
      name: t('pricing.hire_lawyer.title'),
      price: t('pricing.hire_lawyer.fee'),
      period: '',
      priceDesc: t('pricing.hire_lawyer.price_desc'),
      desc: t('pricing.hire_lawyer.desc'),
      features: t('pricing.hire_lawyer.features') || [],
      cta: t('pricing.hire_lawyer.cta'),
      link: '/lawyers',
      popular: true
    },
    {
      id: 'document',
      name: t('pricing.document.title'),
      price: currency === 'uzs' ? t('pricing.document.price_uzs') : t('pricing.document.price_usd'),
      period: currency === 'usd' ? '' : t('pricing.document.period') || '',
      priceDesc: currency === 'uzs' ? t('pricing.currency_uzs') : t('pricing.currency_usd'),
      desc: t('pricing.document.desc'),
      features: t('pricing.document.features') || [],
      cta: t('pricing.document.cta'),
      link: '/chat/document',
      popular: false
    }
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg mb-8">
            {t('pricing.subtitle')}
          </p>
          
          {/* Currency Switcher */}
          <div className="inline-flex bg-white dark:bg-slate-800 p-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setCurrency('uzs')}
              className={`px-8 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                currency === 'uzs' 
                  ? 'bg-[var(--color-primary)] text-white shadow-md scale-100' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 scale-95'
              }`}
            >
              {t('pricing.currency_uzs') || 'UZS'}
            </button>
            <button
              onClick={() => setCurrency('usd')}
              className={`px-8 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${
                currency === 'usd' 
                  ? 'bg-[var(--color-primary)] text-white shadow-md scale-100' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 scale-95'
              }`}
            >
              {t('pricing.currency_usd') || 'USD'}
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`relative bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-10 border transition-all duration-300 flex flex-col h-full ${
                service.popular 
                  ? 'border-[var(--color-primary)] shadow-2xl shadow-blue-900/10 dark:shadow-blue-900/20 md:-translate-y-4' 
                  : 'border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {service.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-[var(--color-secondary)] to-yellow-400 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl rounded-tr-3xl uppercase tracking-wider shadow-sm">
                  Tavsiya etiladi
                </div>
              )}
              
              <div className="mb-8 flex-shrink-0">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {service.name}
                </h3>
                <div className="flex items-end gap-2 text-[var(--color-primary)] dark:text-blue-400 mb-2">
                  <span className="text-5xl font-serif font-black tracking-tight leading-none">
                    {currency === 'usd' && service.id !== 'hire_lawyer' ? '$' : ''}{service.price}
                  </span>
                  <div className="flex flex-col pb-1">
                    <span className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {service.priceDesc}
                    </span>
                    {service.period && (
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                        {service.period}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mt-4 text-[15px] leading-relaxed">
                  {service.desc}
                </p>
              </div>

              <div className="flex-grow">
                <ul className="space-y-4 mb-10">
                  {Array.isArray(service.features) && service.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-4 text-[15px]">
                      <div className="mt-0.5 p-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[var(--color-primary)] dark:text-blue-400 shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span className="text-slate-700 dark:text-slate-200 font-medium">
                        {typeof feature === 'string' ? feature : feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex-shrink-0 mt-auto">
                <Link to={service.link} className="block w-full">
                  <Button 
                    className={`w-full py-4 text-lg font-bold transition-all duration-300 shadow-md hover:shadow-xl ${
                      service.popular 
                        ? 'btn-primary' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {service.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
