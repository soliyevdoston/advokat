import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'lawyer'
  const { t } = useLanguage();

  const plans = {
    user: [
      {
        name: t('pricing.user.free.name'),
        price: "0",
        period: t('pricing.period'),
        desc: t('pricing.user.free.desc'),
        features: [
          { name: t('pricing.user.free.features.search'), included: true },
          { name: t('pricing.user.free.features.basic_ai'), included: true },
          { name: t('pricing.user.free.features.news'), included: true },
          { name: t('pricing.user.free.features.templates'), included: true },
          { name: t('pricing.user.free.features.chat'), included: false },
          { name: t('pricing.user.free.features.emergency'), included: false },
        ],
        cta: t('pricing.user.free.cta'),
        popular: false
      },
      {
        name: t('pricing.user.premium.name'),
        price: "49,000",
        period: t('pricing.period'),
        desc: t('pricing.user.premium.desc'),
        features: [
          { name: t('pricing.user.premium.features.search'), included: true },
          { name: t('pricing.user.premium.features.advanced_ai'), included: true },
          { name: t('pricing.user.premium.features.news'), included: true },
          { name: t('pricing.user.premium.features.unlimited_templates'), included: true },
          { name: t('pricing.user.premium.features.chat_247'), included: true },
          { name: t('pricing.user.premium.features.emergency'), included: true },
        ],
        cta: t('pricing.user.premium.cta'),
        popular: true
      }
    ],
    lawyer: [
      {
        name: t('pricing.lawyer.start.name'),
        price: "199,000",
        period: t('pricing.period'),
        desc: t('pricing.lawyer.start.desc'),
        features: [
          { name: t('pricing.lawyer.start.features.profile'), included: true },
          { name: t('pricing.lawyer.start.features.db_access'), included: true },
          { name: t('pricing.lawyer.start.features.leads'), included: true },
          { name: t('pricing.lawyer.start.features.rating'), included: true },
          { name: t('pricing.lawyer.start.features.crm'), included: false },
          { name: t('pricing.lawyer.start.features.ads'), included: false },
        ],
        cta: t('pricing.lawyer.start.cta'),
        popular: false
      },
      {
        name: t('pricing.lawyer.pro.name'),
        price: "499,000",
        period: t('pricing.period'),
        desc: t('pricing.lawyer.pro.desc'),
        features: [
          { name: t('pricing.lawyer.pro.features.top_profile'), included: true },
          { name: t('pricing.lawyer.pro.features.unlimited_db'), included: true },
          { name: t('pricing.lawyer.pro.features.unlimited_leads'), included: true },
          { name: t('pricing.lawyer.pro.features.rating'), included: true },
          { name: t('pricing.lawyer.pro.features.full_crm'), included: true },
          { name: t('pricing.lawyer.pro.features.ads'), included: true },
        ],
        cta: t('pricing.lawyer.pro.cta'),
        popular: true
      }
    ]
  };

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">{t('pricing.title')}</h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-lg mb-8">
            {t('pricing.subtitle')}
          </p>
          
          <div className="inline-flex bg-white dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('user')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'user' 
                  ? 'bg-[var(--color-primary)] text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('pricing.user_tab')}
            </button>
            <button
              onClick={() => setActiveTab('lawyer')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'lawyer' 
                  ? 'bg-[var(--color-primary)] text-white shadow-md' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t('pricing.lawyer_tab')}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans[activeTab].map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white dark:bg-slate-800 rounded-3xl p-8 border hover:shadow-xl transition-all duration-300 ${
                plan.popular 
                  ? 'border-[var(--color-primary)] shadow-lg ring-1 ring-[var(--color-primary)]/20 shadow-blue-900/10 dark:shadow-none' 
                  : 'border-slate-200 dark:border-slate-700 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-[var(--color-secondary)] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
                  Tavsiya etiladi
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">so'm{plan.period}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">{plan.desc}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    {feature.included ? (
                      <div className="mt-0.5 p-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="mt-0.5 p-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 shrink-0">
                        <X size={12} strokeWidth={3} />
                      </div>
                    )}
                    <span className={feature.included ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600 line-through decoration-slate-300 dark:decoration-slate-600'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Link to="/auth" className="block w-full">
                <Button 
                  className={`w-full ${
                    plan.popular ? 'btn-primary' : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
