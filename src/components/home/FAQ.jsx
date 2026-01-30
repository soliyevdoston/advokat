import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "Onlayn konsultatsiya qanday ishlaydi?",
    answer: "Siz o'zingizga qulay advokatni tanlaysiz va chat orqali bog'lanasiz. To'lovni amalga oshirgandan so'ng, advokat sizga video qo'ng'iroq yoki yozishma orqali to'liq maslahat beradi."
  },
  {
    question: "Advokat xizmatlari narxi qancha?",
    answer: "Narxlar advokatning tajribasi, ishning murakkabligi va turiga qarab belgilanadi. Har bir advokat profilida boshlang'ich narxlar ko'rsatilgan."
  },
  {
    question: "Hujjatlarim maxfiy saqlanadimi?",
    answer: "Ha, albatta. Barcha ma'lumotlar va hujjatlar advokatlik siri hisoblanadi va qat'iy maxfiylik asosida himoyalanadi."
  },
  {
    question: "Sud jarayonida qatnashish shartmi?",
    answer: "Agar siz advokatga ishonchnoma bersangiz, ko'pchilik hollarda sud majlislarida shaxsan qatnashishingiz shart emas. Advokat sizning nomingizdan to'liq vakillik qiladi."
  },
  {
    question: "To'lovni qaytarib olsa bo'ladimi?",
    answer: "Agar xizmat ko'rsatilmagan yoki sifatsiz bo'lsa, platforma qoidalariga muvofiq to'lovni qaytarish tizimi mavjud."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-4">Ko'p So'raladigan Savollar</h2>
          <p className="text-slate-600 text-lg">
            Sizni qiziqtirgan savollarga javoblar
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-[var(--color-primary)] transition-colors duration-300"
            >
              <button
                onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4"
              >
                <span className={`font-bold text-lg ${index === openIndex ? 'text-[var(--color-primary)]' : 'text-slate-900'}`}>
                  {faq.question}
                </span>
                <div className={`p-2 rounded-full transition-colors ${index === openIndex ? 'bg-blue-50 text-[var(--color-primary)]' : 'bg-slate-100 text-slate-500'}`}>
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
                    <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-dashed border-slate-100 mt-2">
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
