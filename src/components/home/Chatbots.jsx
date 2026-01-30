import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, FileJson, ArrowRight, Bot } from 'lucide-react';
import Button from '../ui/Button';

export default function Chatbots() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-[var(--color-primary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-[var(--color-secondary)] rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-serif font-bold text-slate-900 mb-4">Sun'iy Intellekt Yordamchilari</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Bizning aqlli tizimimiz orqali vaqtingizni tejang va sifatli yuridik xizmatdan foydalaning
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          
          {/* Document Generator Bot */}
          <div className="relative overflow-hidden rounded-[2rem] bg-[var(--color-surface-900)] text-white p-10 group shadow-2xl transition-transform hover:-translate-y-2">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100"></div>
             
             <div className="relative z-10 flex flex-col h-full">
               <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 backdrop-blur-sm group-hover:bg-blue-600 transition-colors duration-500">
                 <FileJson className="w-8 h-8 text-blue-300 group-hover:text-white" />
               </div>
               
               <h3 className="text-3xl font-serif font-bold mb-4">Hujjatlar yordamchisi</h3>
               <p className="text-slate-400 mb-8 text-lg leading-relaxed flex-grow">
                 Sun'iy intellekt yordamida har qanday huquqiy hujjatlarni bir necha daqiqada tayyorlang. Ariza, shikoyat va shartnomalar.
               </p>
               
               <Link to="/chat/document">
                 <Button className="bg-blue-600 hover:bg-blue-500 border-none w-full sm:w-auto text-white shadow-lg shadow-blue-900/50">
                   Hujjat yaratish <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                 </Button>
               </Link>
             </div>
          </div>

          {/* Lawyer Connect Bot */}
          <div className="relative overflow-hidden rounded-[2rem] bg-white text-slate-900 p-10 border border-slate-200 group shadow-xl hover:shadow-2xl transition-all hover:-translate-y-2">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
             
             <div className="relative z-10 flex flex-col h-full">
               <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[var(--color-primary)] transition-colors duration-500">
                 <Bot className="w-8 h-8 text-[var(--color-primary)] group-hover:text-white" />
               </div>
               
               <h3 className="text-3xl font-serif font-bold mb-4">Yurist Konsultant</h3>
               <p className="text-slate-600 mb-8 text-lg leading-relaxed flex-grow">
                 Sizning muammoingiz bo'yicha eng mos advokatni topishga va birlamchi maslahat olishga yordam beruvchi aqlli chatbot.
               </p>
               
               <Link to="/chat/lawyer">
                 <Button variant="outline" className="border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white w-full sm:w-auto">
                   Advokat bilan bog'lanish <MessageSquare size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                 </Button>
               </Link>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
