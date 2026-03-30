import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, FileCheck2, Scale, ShieldCheck } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { loadPlatformStats } from '../../utils/platformStats';

const FEATURE_CHIPS = [
  { icon: Clock3, text: 'Tez triage' },
  { icon: FileCheck2, text: 'Ariza oqimi' },
  { icon: ShieldCheck, text: 'Maxfiy muloqot' },
];

export default function Hero() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const run = async () => {
      setStatsLoading(true);
      const payload = await loadPlatformStats();
      if (!active) return;
      setStats(payload);
      setStatsLoading(false);
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  const kpi = [
    { label: 'Faol advokatlar', value: stats?.totalLawyers ? `${stats.totalLawyers}+` : '0' },
    { label: 'Ro‘yxatdan o‘tgan foydalanuvchi', value: stats?.totalUsers ? `${stats.totalUsers}+` : '0' },
    { label: 'Yakunlangan ishlar', value: stats?.resolvedCases ? `${stats.resolvedCases}+` : '0' },
  ];

  return (
    <section className="relative overflow-hidden min-h-screen pt-28 md:pt-32 pb-10 md:pb-14 flex items-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(22,77,136,0.18),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(212,169,102,0.25),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#f1f5fa_100%)] dark:bg-[radial-gradient(circle_at_20%_10%,rgba(32,78,131,0.35),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(212,169,102,0.22),transparent_36%),linear-gradient(180deg,#0f172a_0%,#111f35_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(100,116,139,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(100,116,139,0.15)_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="relative section-wrap w-full">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-primary-300)] bg-white/70 dark:bg-slate-900/60 text-[var(--color-primary)] dark:text-blue-300 text-xs font-semibold">
              <Scale size={14} />
              Yuridik platforma
            </span>

            <h1 className="mt-5 text-4xl md:text-6xl font-serif font-bold leading-[1.05] text-slate-900 dark:text-white">
              {t('hero.title')}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {FEATURE_CHIPS.map((chip) => (
                <span
                  key={chip.text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                  <chip.icon size={13} />
                  {chip.text}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/chat/ai">
                <Button className="px-7 h-12 text-sm">
                  {t('hero.search_btn')}
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/lawyers">
                <Button variant="outline" className="px-7 h-12 text-sm">
                  Advokat tanlash
                </Button>
              </Link>
            </div>
          </div>

          <div className="surface-card p-5 md:p-6">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 font-semibold">
              Tezkor yo`nalish
            </p>
            <h3 className="mt-2 text-2xl font-serif font-bold text-slate-900 dark:text-white">
              Muammoni 30 soniyada tasniflang
            </h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Tizim masala turini aniqlaydi va kerak bo`lsa shu yo`nalishdagi advokatga bevosita o`tkazadi.
            </p>

            <div className="mt-5 space-y-2">
              <QuickLine text="AI triage natijasi saqlanadi" />
              <QuickLine text="Ariza avtomatik biriktiriladi" />
              <QuickLine text="Chat va hujjat oqimi bitta joyda" />
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              {kpi.map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/70">
                  {statsLoading ? (
                    <div className="space-y-1.5 animate-pulse">
                      <div className="h-5 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                  ) : (
                    <>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{item.value}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{item.label}</p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickLine({ text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)]" />
      <span>{text}</span>
    </div>
  );
}
