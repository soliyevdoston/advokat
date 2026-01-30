import React from 'react';
import { Shield, Users, Trophy, Target, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function About() {
  const stats = [
    { label: "Yillik Tajriba", value: "10+", icon: Trophy },
    { label: "Malakali Advokatlar", value: "50+", icon: Users },
    { label: "Muvaffaqiyatli Ishlar", value: "1500+", icon: CheckCircle2 },
    { label: "Qoniqish Darajasi", value: "98%", icon: Target },
  ];

  const values = [
    {
      title: "Professionalizm",
      desc: "Bizning jamoamiz faqat yuqori malakali va tajribali mutaxassislardan iborat.",
      icon: <Shield className="w-6 h-6 text-white" />,
      color: "bg-blue-600"
    },
    {
      title: "Shaffoflik",
      desc: "Har bir jarayon va narxlar oldindan kelishilgan holda shaffof amalga oshiriladi.",
      icon: <CheckCircle2 className="w-6 h-6 text-white" />,
      color: "bg-green-600"
    },
    {
      title: "Innovatsiya",
      desc: "Huquqiy xizmatlarni ko'rsatishda eng so'nggi texnologiya va yechimlardan foydalanamiz.",
      icon: <Target className="w-6 h-6 text-white" />,
      color: "bg-purple-600"
    }
  ];

  return (
    <div className="bg-white min-h-screen pt-32 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header / Hero */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6 leading-tight">
              Adolat va qonun <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-blue-600">ustuvorligi</span> yo'lida
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              "Advokat" platformasi O'rta Osiyoda huquqiy xizmatlarni raqamlashtirish va aholiga sifatli yuridik yordam ko'rsatish maqsadida tashkil etilgan innovatsion loyihadir. Bizning maqsadimiz — har bir inson uchun huquqiy himoyani qulay va ishonchli qilish.
            </p>
            
            <div className="flex gap-4">
              <Link to="/lawyers">
                <Button className="btn-primary" size="lg">
                  Jamoamiz bilan tanishing <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-square">
              <img 
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=2000" 
                alt="Our Team" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply" />
            </div>
            {/* Decor elements */}
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-[var(--color-secondary)]/20 rounded-full blur-3xl -z-10" />
            <div className="absolute top-8 -left-8 w-32 h-32 border-4 border-[var(--color-primary)]/10 rounded-full -z-10" />
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-all duration-300 group">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <stat.icon className="w-6 h-6 text-[var(--color-secondary)]" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</h3>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Values Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Bizning qadriyatlarimiz</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Biz har bir mijozga individual yondashuv va yuqori sifatli xizmat ko'rsatishga intilamiz
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((item, index) => (
              <div key={index} className="bg-slate-50 p-8 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-100">
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[var(--color-primary)] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-secondary)] rounded-full mix-blend-overlay filter blur-3xl"></div>
           </div>
           
           <div className="relative z-10 max-w-3xl mx-auto">
             <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Huquqiy himoyaga muhtojmisiz?</h2>
             <p className="text-blue-100 text-lg mb-10 leading-relaxed">
               Hoziroq bizning malakali advokatlarimizga murojaat qiling yoki sun'iy intellekt yordamchisidan bepul maslahat oling.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <Link to="/chat">
                 <Button className="bg-white text-[var(--color-primary)] hover:bg-blue-50 border-none px-8 py-4 h-auto text-lg w-full sm:w-auto">
                   Bepul maslahat olish
                 </Button>
               </Link>
               <Link to="/lawyers">
                 <Button variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 h-auto text-lg w-full sm:w-auto">
                   Advokat bilan bog'lanish
                 </Button>
               </Link>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
