import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Scale, Shield, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=2000" 
          alt="Modern Law Office" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-transparent to-slate-900/40" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-sm font-medium tracking-wide">O'rta Osiyoda yagona huquqiy platforma</span>
          </div>
          
          <h1 className="text-4xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-6 md:mb-8 tracking-tight">
            <span className="text-amber-400 drop-shadow-lg">Adolat va Qonun</span> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-blue-200">
              Ustuvorligi
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-200 mb-8 md:mb-12 max-w-3xl mx-auto font-light leading-relaxed px-4">
            Murakkab huquqiy masalalarga oddiy va samarali yechimlar. Malakali advokatlar va sun'iy intellekt yordamida himoyalang.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/chat">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-blue-50 border-none px-10 py-5 text-lg font-bold shadow-2xl shadow-white/10 group">
                Qanday muammoga duch keldingiz? <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10 px-10 py-5 text-lg backdrop-blur-sm">
                Xizmatlar
              </Button>
            </Link>
          </div>

          {/* Stats / Trust Indicators */}
          <div className="mt-20 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Muvaffaqiyat", value: "98%" },
              { label: "Tajriba", value: "10+ Yil" },
              { label: "Advokatlar", value: "50+" },
              { label: "Mijozlar", value: "1500+" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
