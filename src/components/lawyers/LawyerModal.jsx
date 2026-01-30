import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MapPin, Briefcase, Award, GraduationCap, MessageSquare, Phone, Globe } from 'lucide-react';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

export default function LawyerModal({ lawyer, isOpen, onClose }) {
  if (!isOpen || !lawyer) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all duration-200 transform hover:rotate-90"
          >
            <X size={24} />
          </button>

          <div className="grid md:grid-cols-2">
            {/* Left Side: Image & Quick Stats */}
            <div className="relative h-72 md:h-auto bg-slate-900 group">
              <img 
                src={lawyer.image} 
                alt={lawyer.name} 
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 px-3 py-1 rounded-full">
                     <Star className="text-yellow-400 fill-yellow-400" size={16} />
                     <span className="font-bold text-yellow-100">{lawyer.rating}</span>
                  </div>
                  <span className="text-slate-300 text-sm">({lawyer.reviews} ta sharh)</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2 leading-tight">{lawyer.name}</h2>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin size={18} className="text-[var(--color-secondary)]" />
                  {lawyer.location}
                </div>
              </div>
            </div>

            {/* Right Side: Details */}
            <div className="p-8 md:p-10 flex flex-col justify-between">
              <div>
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Award className="text-[var(--color-primary)]" size={18} />
                    Mutaxassislik va Tajriba
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 bg-blue-50 text-[var(--color-primary)] rounded-xl font-medium border border-blue-100">
                      {lawyer.specialization}
                    </span>
                    <span className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-medium border border-purple-100">
                      {lawyer.level}
                    </span>
                    <span className="px-4 py-2 bg-green-50 text-green-700 rounded-xl font-medium border border-green-100">
                      {lawyer.experience} tajriba
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-3xl font-bold text-slate-900 block mb-1">{lawyer.cases.total}</span>
                    <span className="text-sm text-slate-500 font-medium">Jami ishlar</span>
                  </div>
                  <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
                    <span className="text-3xl font-bold text-green-600 block mb-1">{lawyer.cases.won}</span>
                    <span className="text-sm text-green-700 font-medium">Muvaffaqiyatli</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Globe className="text-[var(--color-primary)]" size={18} />
                    So'zlashuv tillari
                  </h3>
                  <div className="flex gap-2">
                    {lawyer.languages.map(lang => (
                      <span key={lang} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-medium">
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link to={`/chat/lawyer/${lawyer.id}`} className="flex-1">
                  <Button 
                    className="w-full gap-2 btn-primary shadow-lg shadow-blue-900/20" 
                    size="lg"
                  >
                    <MessageSquare size={20} />
                    Xabar yozish
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="px-6 border-slate-200 hover:border-[var(--color-primary)] text-slate-600 hover:text-[var(--color-primary)] hover:bg-blue-50">
                  <Phone size={20} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
