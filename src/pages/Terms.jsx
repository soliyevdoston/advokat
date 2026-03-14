import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            Foydalanish Shartlari
          </h1>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            Platformadan foydalanish orqali quyidagi shartlarga rozilik bildiriladi.
          </p>

          <div className="space-y-6 text-slate-700 dark:text-slate-200 leading-relaxed">
            <section>
              <h2 className="font-bold text-lg mb-2">1. Xizmat doirasi</h2>
              <p>Platforma yuridik ma'lumot va mutaxassis bilan bog'lanish imkonini beradi.</p>
            </section>
            <section>
              <h2 className="font-bold text-lg mb-2">2. Foydalanuvchi majburiyati</h2>
              <p>To'g'ri ma'lumot kiritish, noqonuniy faoliyatga yo'l qo'ymaslik va platforma qoidalariga rioya qilish.</p>
            </section>
            <section>
              <h2 className="font-bold text-lg mb-2">3. To'lov va obuna</h2>
              <p>Pullik xizmatlar uchun tariflar va obuna shartlari alohida e'lon qilinadi.</p>
            </section>
            <section>
              <h2 className="font-bold text-lg mb-2">4. Javobgarlik cheklovi</h2>
              <p>AI javoblari maslahat xarakterida bo'lib, yakuniy qaror uchun mutaxassis fikri tavsiya etiladi.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

