import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            Maxfiylik Siyosati
          </h1>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            Ushbu sahifa foydalanuvchi ma'lumotlari qanday yig'ilishi, saqlanishi va ishlatilishini tushuntiradi.
          </p>
          <div className="mb-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
            Suhbatlar 100% maxfiy bo'lib, xavfsizlik talablariga muvofiq himoyalangan holda saqlanadi.
          </div>

          <div className="space-y-6 text-slate-700 dark:text-slate-200 leading-relaxed">
            <section>
              <h2 className="font-bold text-lg mb-2">1. Yig'iladigan ma'lumotlar</h2>
              <p>Email, texnik loglar, chat yozishmalari va xizmatdan foydalanish statistikasi.</p>
            </section>
            <section>
              <h2 className="font-bold text-lg mb-2">2. Maqsad</h2>
              <p>Xizmat sifati, xavfsizlik, murojaatlarni ko'rib chiqish va foydalanuvchini qo'llab-quvvatlash.</p>
            </section>
            <section>
              <h2 className="font-bold text-lg mb-2">3. Saqlash va himoya</h2>
              <p>Ma'lumotlar himoyalangan holda saqlanadi, ruxsatsiz kirish qat'iy cheklanadi va xavfsizlik monitoringi doimiy olib boriladi.</p>
            </section>
            <section>
              <h2 className="font-bold text-lg mb-2">4. Aloqa</h2>
              <p>Maxfiylik bo'yicha savollar uchun: `info@advokat.uz`</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
