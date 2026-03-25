import React, { useMemo, useState } from 'react';
import { Activity, ArrowRight, Bot, Clock3, Scale, ShieldCheck, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatQuickCheckPrompt, saveQuickLegalCheck } from '../../utils/quickLegalCheck';

const LIVE_METRICS = [
  { label: 'Bugungi yangi murojaatlar', value: '42+' },
  { label: 'O\'rtacha birinchi javob', value: '2.4 min' },
  { label: 'Mijoz qoniqishi', value: '4.8/5' },
];

const URGENCY_OPTIONS = [
  { value: 'low', label: 'Shoshilinch emas' },
  { value: 'medium', label: '2-3 kun ichida kerak' },
  { value: 'high', label: 'Bugun hal qilish kerak' },
];

const TOPIC_OPTIONS = [
  { value: 'document', label: 'Hujjat tayyorlash' },
  { value: 'consult', label: 'Maslahat / tushuntirish' },
  { value: 'dispute', label: 'Nizo yoki sud ishi' },
];

const STYLE_OPTIONS = [
  { value: 'ai', label: 'Avval AI bilan boshlayman' },
  { value: 'expert', label: 'Darhol mutaxassis kerak' },
];

const PRO_PRICE_UZS = 149000;
const PRO_PRICE_LABEL = '149 000 UZS';

const getRecommendation = ({ urgency, topic, style }) => {
  if (urgency === 'high' || topic === 'dispute' || style === 'expert') {
    return {
      title: 'Sizga tezkor advokat ulanish tavsiya qilinadi',
      desc: 'Murakkab yoki shoshilinch holat. AI triage dan keyin mos advokatga avtomatik yo‘naltirilasiz.',
      to: '/chat/ai',
      cta: 'Pro rejimda boshlash',
      icon: Scale,
      tone: 'rose',
      isPro: true,
      proPriceUzs: PRO_PRICE_UZS,
      proPriceLabel: PRO_PRICE_LABEL,
    };
  }

  if (topic === 'document') {
    return {
      title: 'Avval hujjat generatoridan boshlang',
      desc: 'Ariza yoki shartnoma draftini 2-3 daqiqada tayyorlab, keyin advokatga tekshirtirasiz.',
      to: '/chat/document',
      cta: 'Hujjat yaratish',
      icon: ShieldCheck,
      tone: 'emerald',
      isPro: false,
    };
  }

  return {
    title: 'AI konsultatsiya siz uchun mos',
    desc: 'Savolingizni AI ga bering, kerak bo\'lsa bir klikda mutaxassisga o\'tkazamiz.',
    to: '/chat/ai',
    cta: 'AI bilan boshlash',
    icon: Bot,
    tone: 'blue',
    isPro: false,
  };
};

export default function InteractiveHighlights() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [urgency, setUrgency] = useState('medium');
  const [topic, setTopic] = useState('consult');
  const [style, setStyle] = useState('ai');
  const recommendation = useMemo(() => getRecommendation({ urgency, topic, style }), [urgency, topic, style]);
  const RecIcon = recommendation.icon;

  const handleContinue = () => {
    const payload = {
      urgency,
      topic,
      style,
      target: recommendation.to,
      recommendationTitle: recommendation.title,
      prompt: formatQuickCheckPrompt({ urgency, topic, style }),
      isPro: Boolean(recommendation.isPro),
      proPriceUzs: recommendation.proPriceUzs || 0,
      proPriceLabel: recommendation.proPriceLabel || '',
    };

    saveQuickLegalCheck(payload);

    if (!user) {
      navigate('/auth', {
        state: {
          isLogin: false,
          from: { pathname: recommendation.to },
          source: 'quick_legal_check',
        },
      });
      return;
    }

    navigate(recommendation.to);
  };

  return (
    <section className="py-14 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 surface-card rounded-3xl p-5 md:p-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
              <Activity size={13} /> Live ko'rsatkichlar
            </div>
            <div className="mt-4 space-y-3">
              {LIVE_METRICS.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white/80 dark:bg-slate-800 px-4 py-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Maqsad: 3 daqiqadan kam birinchi javob va tez triage.
            </p>
          </div>

          <div className="lg:col-span-2 surface-card rounded-3xl p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
                <Sparkles size={20} className="text-amber-500" />
                Tez Legal Check
              </h3>
              <span className="text-xs px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
                <Clock3 size={13} /> 30 soniya
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Picker title="1. Muammo shoshilinchligi" options={URGENCY_OPTIONS} value={urgency} onChange={setUrgency} />
              <Picker title="2. Murojaat turi" options={TOPIC_OPTIONS} value={topic} onChange={setTopic} />
              <Picker title="3. Qaysi uslub qulay?" options={STYLE_OPTIONS} value={style} onChange={setStyle} />
            </div>

            <div className={`mt-5 rounded-2xl border p-4 ${
              recommendation.tone === 'rose'
                ? 'border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/20'
                : recommendation.tone === 'emerald'
                  ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'
                  : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  {recommendation.isPro && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800 mb-2">
                      Pro
                    </span>
                  )}
                  <p className="font-semibold text-slate-900 dark:text-white">{recommendation.title}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{recommendation.desc}</p>
                  {recommendation.isPro && (
                    <p className="text-xs font-semibold text-rose-700 dark:text-rose-300 mt-2">
                      Narx: {recommendation.proPriceLabel} (Pro)
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  <RecIcon size={18} className="text-slate-700 dark:text-slate-200" />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleContinue}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  {recommendation.cta}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Picker({ title, options, value, onChange }) {
  return (
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{title}</p>
      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`w-full text-left text-sm px-3 py-2.5 rounded-xl border transition-colors ${
              value === option.value
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-400'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
