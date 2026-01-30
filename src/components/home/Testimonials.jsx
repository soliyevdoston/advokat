import React from 'react';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: "Azizbek Tursunov",
    role: "Tadbirkor",
    content: "Mening biznesimdagi murakkab yuridik masalani juda tez va professional hal qilib berishdi. Advokatlarning malakasi yuqori darajada.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Malika Karimova",
    role: "O'qituvchi",
    content: "Oila huquqi bo'yicha maslahat oldim. Juda samimiy va tushunarli tushuntirishdi. Barcha savollarimga javob topdim.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Jamshid Aliyev",
    role: "Dasturchi",
    content: "Onlayn konsultasiya xizmati juda qulay ekan. Vaqtni tejash uchun ajoyib imkoniyat. Rahmat!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-1/4 -left-64 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl"></div>
         <div className="absolute bottom-1/4 -right-64 w-96 h-96 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Mijozlarimiz Fikrlari</h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Bizning xizmatlarimizdan foydalangan insonlarning samimiy fikrlari
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700 hover:border-[var(--color-primary)] transition-colors group"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              
              <Quote className="w-10 h-10 text-slate-600 mb-4 opacity-50 group-hover:text-[var(--color-primary)] group-hover:opacity-100 transition-all" />
              
              <p className="text-slate-300 italic mb-8 leading-relaxed">
                "{item.content}"
              </p>
              
              <div className="flex items-center gap-4">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-600 group-hover:border-[var(--color-primary)] transition-colors"
                />
                <div>
                  <h4 className="font-bold text-white">{item.name}</h4>
                  <p className="text-sm text-slate-400">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
