import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, BadgeCheck, FileClock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { saveQuickLegalCheck } from '../../utils/quickLegalCheck';

const urgencyWeights = {
  low: 20,
  medium: 55,
  high: 85,
};

const evidenceWeights = {
  ready: 20,
  partial: 10,
  none: 0,
};

export default function InnovationLab() {
  const [form, setForm] = useState({
    urgency: 'medium',
    topic: 'consult',
    style: 'expert',
    evidence: 'partial',
  });

  const score = useMemo(() => {
    return Math.min(
      100,
      (urgencyWeights[form.urgency] || 0) + (evidenceWeights[form.evidence] || 0)
    );
  }, [form.evidence, form.urgency]);

  const recommendation = useMemo(() => {
    if (form.urgency === 'high' || score >= 80) {
      return {
        title: 'Darhol mutaxassis bilan chat oching',
        desc: 'Vaziyat shoshilinch. Hozirning o‘zida support chatga o‘tib dalillarni yuboring.',
        target: '/chat/support',
      };
    }

    if (form.topic === 'document') {
      return {
        title: 'Avval hujjat draftini tayyorlang',
        desc: 'Hujjat bo‘yicha struktura va matnni tez olish uchun document chatdan boshlang.',
        target: '/chat/document',
      };
    }

    return {
      title: 'AI bilan boshlang, keyin advokatga o‘ting',
      desc: 'Masalani AI orqali aniqlab, kerak bo‘lsa advokatga eskalatsiya qiling.',
      target: '/chat/ai',
    };
  }, [form.topic, form.urgency, score]);

  const handlePrepare = () => {
    saveQuickLegalCheck({
      urgency: form.urgency,
      topic: form.topic,
      style: form.style,
      recommendationTitle: recommendation.title,
      target: recommendation.target,
    });
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20">
            <Sparkles size={13} />
            Innovation Lab
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            Yuridik Triage Radar
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Muammo darajasini 20 soniyada baholab, eng to‘g‘ri keyingi qadamni tavsiya qilamiz.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Shoshilinchlik">
                <select
                  value={form.urgency}
                  onChange={(event) => setForm((prev) => ({ ...prev, urgency: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm"
                >
                  <option value="low">Shoshilinch emas</option>
                  <option value="medium">2-3 kun ichida</option>
                  <option value="high">Bugun hal bo‘lishi kerak</option>
                </select>
              </Field>

              <Field label="Murojaat turi">
                <select
                  value={form.topic}
                  onChange={(event) => setForm((prev) => ({ ...prev, topic: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm"
                >
                  <option value="consult">Maslahat</option>
                  <option value="document">Hujjat tayyorlash</option>
                  <option value="dispute">Nizo / sud jarayoni</option>
                </select>
              </Field>

              <Field label="Hozirgi yondashuv">
                <select
                  value={form.style}
                  onChange={(event) => setForm((prev) => ({ ...prev, style: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm"
                >
                  <option value="ai">Avval AI bilan</option>
                  <option value="expert">Darhol mutaxassis</option>
                </select>
              </Field>

              <Field label="Dalillar holati">
                <select
                  value={form.evidence}
                  onChange={(event) => setForm((prev) => ({ ...prev, evidence: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2.5 text-sm"
                >
                  <option value="ready">Dalillar tayyor</option>
                  <option value="partial">Qisman tayyor</option>
                  <option value="none">Hali tayyor emas</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-900 text-white p-6 md:p-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="relative">
              <p className="text-sm text-blue-200 mb-3">Legal readiness score</p>
              <div className="text-5xl font-black">{score}</div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full ${score >= 80 ? 'bg-red-400' : score >= 50 ? 'bg-amber-300' : 'bg-emerald-300'}`}
                  style={{ width: `${score}%` }}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="font-semibold inline-flex items-center gap-2">
                  <BadgeCheck size={16} className="text-emerald-300" />
                  {recommendation.title}
                </p>
                <p className="text-sm text-blue-100 mt-1 leading-relaxed">{recommendation.desc}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  to={recommendation.target}
                  onClick={handlePrepare}
                  className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 px-4 py-2.5 text-sm font-bold hover:bg-blue-50 transition-colors"
                >
                  Boshlash <ArrowRight size={15} />
                </Link>
                <span className="inline-flex items-center gap-1.5 text-xs text-blue-100">
                  <FileClock size={13} />
                  Triage ma’lumotlari chatga avtomatik uzatiladi
                </span>
              </div>

              {score >= 80 && (
                <p className="mt-4 text-xs text-amber-200 inline-flex items-center gap-1.5">
                  <AlertTriangle size={13} />
                  Yuqori risk aniqlangan: kechiktirmasdan mutaxassis bilan bog‘laning.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}
