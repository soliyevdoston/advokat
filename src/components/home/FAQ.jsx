import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const { t } = useLanguage();

  const faqs = [
    {
      question: t('faq.items.0.q'),
      answer: t('faq.items.0.a')
    },
    {
      question: t('faq.items.1.q'),
      answer: t('faq.items.1.a')
    },
    {
      question: t('faq.items.2.q'),
      answer: t('faq.items.2.a')
    },
    {
      question: t('faq.items.3.q'),
      answer: t('faq.items.3.a')
    },
    {
      question: t('faq.items.4.q'),
      answer: t('faq.items.4.a')
    }
  ];

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-4">{t('faq.title')}</h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-[var(--color-primary)] transition-colors duration-300"
            >
              <button
                onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4"
              >
                <span className={`font-bold text-lg ${index === openIndex ? 'text-[var(--color-primary)] dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                  {faq.question}
                </span>
                <div className={`p-2 rounded-full transition-colors ${index === openIndex ? 'bg-blue-50 dark:bg-blue-900/30 text-[var(--color-primary)] dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                  {index === openIndex ? <Minus size={20} /> : <Plus size={20} />}
                </div>
              </button>
              
              <AnimatePresence>
                {index === openIndex && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-dashed border-slate-100 dark:border-slate-700 mt-2">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
