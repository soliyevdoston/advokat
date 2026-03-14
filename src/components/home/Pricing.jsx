import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { openClickPayment } from '../../utils/clickPayment';
const MotionDiv = motion.div;

export default function Pricing() {
  const [currency, setCurrency] = useState('uzs'); // 'uzs' yoki 'usd'
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

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
      id: 'subscription',
      name: 'Hujjat tayyorlash',
      price: '50,000',
      period: '/hujjat',
      priceDesc: 'UZS',
      desc: "Barcha turdagi huquqiy hujjatlar, shartnomalar, va da'vo arizalarini professional yuristlar tomonidan tez va sifatli tayyorlash.",
      features: [
        'Tezkor hujjat tayyorlash',
        'Qonunchilikka 100% moslik',
        'Elektron shaklda yetkazib berish',
        'Xatolar uchun qayta bepul tahrirlash',
        'Konsultatsiya bepul',
      ],
      cta: 'Hujjat buyurtma qilish',
      checkout: 'click',
      amountUzs: 50000,
      amountUsd: 4.5,
      freeNote: '1 ta hujjat tekin',
      discount: '12% chegirma',
      popular: false,
    },
  ];

  const handleCheckout = (service) => {
    if (service.checkout !== 'click') return;

    if (!user) {
      navigate('/auth', {
        state: {
          isLogin: false,
          from: { pathname: '/' },
          source: 'click_checkout',
        },
      });
      return;
    }

    const amount = currency === 'usd' ? service.amountUsd : service.amountUzs;
    const opened = openClickPayment({
      amount,
      plan: service.id,
      userEmail: user?.email || '',
    });

    if (!opened) {
      window.alert('Click to‘lovi sozlanmagan. .env faylga VITE_CLICK_* qiymatlarini kiriting.');
    }
  };

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
            <MotionDiv
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={`surface-card relative rounded-3xl p-8 md:p-10 flex flex-col h-full ${
                service.popular 
                  ? 'border-[var(--color-primary)] ring-2 ring-blue-100 dark:ring-blue-900/40' 
                  : ''
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
                {service.freeNote && (
                  <span className="inline-flex mb-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
                    {service.freeNote}
                  </span>
                )}
                {service.discount && (
                  <span className="inline-flex mb-2 ml-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800">
                    {service.discount}
                  </span>
                )}
                {service.checkout === 'click' && (
                  <button
                    type="button"
                    onClick={() => handleCheckout(service)}
                    className="inline-flex mb-2 ml-2 items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 hover:opacity-90 transition-opacity"
                    title="Click ilovasi yoki to'lov sahifasiga o'tish"
                  >
                    <span className="inline-flex w-5 h-5 rounded-full bg-blue-600 text-white items-center justify-center text-[10px] leading-none">C</span>
                    CLICK
                  </button>
                )}
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
                {service.checkout === 'click' ? (
                  <Button
                    onClick={() => handleCheckout(service)}
                    className={`w-full py-4 text-lg font-bold transition-all duration-300 shadow-md hover:shadow-xl ${
                      service.popular
                        ? 'btn-primary'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {service.cta}
                  </Button>
                ) : (
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
                )}
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
