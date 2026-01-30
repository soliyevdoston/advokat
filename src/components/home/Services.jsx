import React from 'react';
import { Briefcase, Scale, Users, FileText, Globe, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: <Scale className="w-8 h-8 text-[var(--color-primary)]" />,
    title: "Jinoyat huquqi",
    desc: "Jinoyat ishlari bo'yicha himoya va maslahatlar. Tergov va sud jarayonlarida ishtirok etish."
  },
  {
    icon: <Users className="w-8 h-8 text-[var(--color-primary)]" />,
    title: "Oila huquqi",
    desc: "Nikohdan ajralish, aliment, mulk bo'linishi va farzandlikka olish masalalari bo'yicha yordam."
  },
  {
    icon: <Briefcase className="w-8 h-8 text-[var(--color-primary)]" />,
    title: "Biznes va Korporativ",
    desc: "Biznesni ro'yxatdan o'tkazish, shartnomalar tuzish va korporativ nizolarni hal qilish."
  },
  {
    icon: <FileText className="w-8 h-8 text-[var(--color-primary)]" />,
    title: "Fuqarolik huquqi",
    desc: "Mulk, meros, qarz va boshqa fuqarolik nizolarini qonuniy hal etish xizmatlari."
  },
  {
    icon: <Globe className="w-8 h-8 text-[var(--color-primary)]" />,
    title: "Xalqaro huquq",
    desc: "Chet el fuqarolari va kompaniyalari uchun huquqiy maslahatlar va vakillik."
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-[var(--color-primary)]" />,
    title: "Mehnat huquqi",
    desc: "Ish beruvchi va xodim o'rtasidagi nizolar, noqonuniy ishdan bo'shatish masalalari."
  }
];

export default function Services() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-4">Bizning Xizmatlar</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Biz barcha turdagi huquqiy masalalar bo'yicha professional yordam ko'rsatamiz.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Link 
              to="/lawyers" 
              state={{ category: service.title }}
              key={index}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 h-full rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {service.desc}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
