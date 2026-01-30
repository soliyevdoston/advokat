import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const plans = {
  user: [
    {
      name: "Bepul",
      price: "0",
      period: "/oy",
      desc: "Yuridik yordamga muhtoj fuqarolar uchun",
      features: [
        { name: "Advokatlarni izlash", included: true },
        { name: "Basic AI yordamchi", included: true },
        { name: "Yangiliklar lentasi", included: true },
        { name: "Hujjat shablonlari (3 ta/oy)", included: true },
        { name: "Chat orqali konsultatsiya", included: false },
        { name: "Shoshilinch yordam", included: false },
      ],
      cta: "Boshlash",
      popular: false
    },
    {
      name: "Premium",
      price: "49,000",
      period: "/oy",
      desc: "Doimiy huquqiy himoya va qo'shimcha imkoniyatlar",
      features: [
        { name: "Advokatlarni izlash", included: true },
        { name: "Advanced AI yordamchi (Cheklovsiz)", included: true },
        { name: "Yangiliklar lentasi", included: true },
        { name: "Cheklovsiz hujjat shablonlari", included: true },
        { name: "24/7 Chat konsultatsiya", included: true },
        { name: "Shoshilinch yordam tugmasi", included: true },
      ],
      cta: "Obuna bo'lish",
      popular: true
    }
  ],
  lawyer: [
    {
      name: "Start",
      price: "199,000",
      period: "/oy",
      desc: "Yangi boshlayotgan advokatlar uchun",
      features: [
        { name: "Shaxsiy profil", included: true },
        { name: "Mijozlar bazasiga kirish", included: true },
        { name: "Oyiga 10 ta mijoz so'rovi", included: true },
        { name: "Reyting tizimi", included: true },
        { name: "CRM tizimi", included: false },
        { name: "Reklama imkoniyatlari", included: false },
      ],
      cta: "Ro'yxatdan o'tish",
      popular: false
    },
    {
      name: "Pro",
      price: "499,000",
      period: "/oy",
      desc: "Tajribali advokatlar va firmalar uchun",
      features: [
        { name: "Shaxsiy profil (Top ro'yxatda)", included: true },
        { name: "Cheklovsiz mijozlar bazasi", included: true },
        { name: "Cheklovsiz mijoz so'rovi", included: true },
        { name: "Reyting tizimi", included: true },
        { name: "To'liq CRM tizimi", included: true },
        { name: "Reklama va targ'ibot", included: true },
      ],
      cta: "Hamkorlik qilish",
      popular: true
    }
  ]
};

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'lawyer'

  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-4">Tariflar Rejasi</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg mb-8">
            Sizga mos keluvchi tarifni tanlang va huquqiy xizmatlardan foydalaning
          </p>
          
          <div className="inline-flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab('user')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'user' 
                  ? 'bg-[var(--color-primary)] text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Foydalanuvchilar
            </button>
            <button
              onClick={() => setActiveTab('lawyer')}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'lawyer' 
                  ? 'bg-[var(--color-primary)] text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Advokatlar
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
              className={`relative bg-white rounded-3xl p-8 border hover:shadow-xl transition-all duration-300 ${
                plan.popular 
                  ? 'border-[var(--color-primary)] shadow-lg ring-1 ring-[var(--color-primary)]/20' 
                  : 'border-slate-200 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-[var(--color-secondary)] text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">
                  Tavsiya etiladi
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-serif font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500 font-medium tracking-tight">so'm{plan.period}</span>
                </div>
                <p className="text-slate-500 mt-2 text-sm">{plan.desc}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    {feature.included ? (
                      <div className="mt-0.5 p-0.5 rounded-full bg-green-100 text-green-600 shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="mt-0.5 p-0.5 rounded-full bg-slate-100 text-slate-400 shrink-0">
                        <X size={12} strokeWidth={3} />
                      </div>
                    )}
                    <span className={feature.included ? 'text-slate-700' : 'text-slate-400 line-through decoration-slate-300'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Link to="/auth" className="block w-full">
                <Button 
                  className={`w-full ${
                    plan.popular ? 'btn-primary' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
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
