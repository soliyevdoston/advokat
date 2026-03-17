import React, { useState } from 'react';
import { CheckCircle2, Shield } from 'lucide-react';

const PRIVACY_PREFS_KEY = 'legallink_privacy_prefs_v1';

const readPrefs = () => {
  try {
    const raw = localStorage.getItem(PRIVACY_PREFS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function Privacy() {
  const initial = readPrefs() || {
    productEmails: true,
    analytics: true,
    personalization: true,
  };

  const [prefs, setPrefs] = useState(initial);
  const [saved, setSaved] = useState(false);

  const savePrefs = () => {
    localStorage.setItem(PRIVACY_PREFS_KEY, JSON.stringify({ ...prefs, updatedAt: new Date().toISOString() }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            Maxfiylik Siyosati
          </h1>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Oxirgi yangilanish: 2026-yil 17-mart. Ushbu sahifa foydalanuvchi ma'lumotlari qanday yig'ilishi, saqlanishi va ishlatilishini tushuntiradi.
          </p>
          <div className="mb-6 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200 inline-flex items-center gap-2">
            <Shield size={16} />
            Suhbatlar maxfiy va xavfsizlik standartlariga muvofiq himoyalangan.
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
              <p>Maxfiylik bo'yicha savollar uchun: info@advokat.uz</p>
            </section>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Maxfiylik sozlamalari</h3>
            <div className="space-y-2 text-sm">
              <ToggleRow
                label="Xizmat bo‘yicha email bildirishnomalari"
                checked={prefs.productEmails}
                onChange={(value) => setPrefs((prev) => ({ ...prev, productEmails: value }))}
              />
              <ToggleRow
                label="Anonim analytics"
                checked={prefs.analytics}
                onChange={(value) => setPrefs((prev) => ({ ...prev, analytics: value }))}
              />
              <ToggleRow
                label="Shaxsiylashtirilgan tavsiyalar"
                checked={prefs.personalization}
                onChange={(value) => setPrefs((prev) => ({ ...prev, personalization: value }))}
              />
            </div>

            <button
              type="button"
              onClick={savePrefs}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold"
            >
              Saqlash
            </button>

            {saved && (
              <p className="mt-2 text-xs text-emerald-600 inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                Sozlamalar saqlandi
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2">
      <span className="text-slate-700 dark:text-slate-200">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}
