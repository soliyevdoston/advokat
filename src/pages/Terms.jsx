import React, { useState } from 'react';
import { CheckCircle2, FileCheck2 } from 'lucide-react';

const TERMS_ACCEPT_KEY = 'legallink_terms_acceptance_v1';

const readAcceptance = () => {
  try {
    const raw = localStorage.getItem(TERMS_ACCEPT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function Terms() {
  const initial = readAcceptance();
  const [accepted, setAccepted] = useState(Boolean(initial?.accepted));
  const [acceptedAt, setAcceptedAt] = useState(initial?.acceptedAt || '');
  const [saved, setSaved] = useState(false);

  const saveAcceptance = () => {
    const payload = {
      accepted,
      acceptedAt: accepted ? new Date().toISOString() : '',
    };
    localStorage.setItem(TERMS_ACCEPT_KEY, JSON.stringify(payload));
    setAcceptedAt(payload.acceptedAt);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-4">
            Foydalanish Shartlari
          </h1>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            Oxirgi yangilanish: 2026-yil 17-mart. Platformadan foydalanish orqali quyidagi shartlarga rozilik bildiriladi.
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

          <div className="mt-8 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <p className="text-sm font-semibold text-slate-900 dark:text-white inline-flex items-center gap-2">
              <FileCheck2 size={16} className="text-blue-600" />
              Raqamli qabul (local)
            </p>
            <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => setAccepted(event.target.checked)}
              />
              Men foydalanish shartlarini o‘qidim va qabul qilaman.
            </label>

            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={saveAcceptance}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold"
              >
                Qabulni saqlash
              </button>
              {acceptedAt && (
                <span className="text-xs text-slate-500">
                  Oxirgi qabul: {new Date(acceptedAt).toLocaleString()}
                </span>
              )}
            </div>

            {saved && (
              <p className="mt-2 text-xs text-emerald-600 inline-flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                Holat saqlandi
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
