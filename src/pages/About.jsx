import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  Handshake,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Users2,
} from 'lucide-react';
import Button from '../components/ui/Button';
import { loadPlatformStats } from '../utils/platformStats';

const TRUST_POINTS = [
  {
    title: 'Malakali advokatlar jamoasi',
    text: 'Platformada turli yo\'nalishlarda amaliy tajribaga ega professional advokatlar ishlaydi.',
    icon: Scale,
  },
  {
    title: 'Shaffof ish oqimi',
    text: 'AI tahlildan keyin mijoz murojaati mos advokat kabinetiga biriktiriladi va status kuzatib boriladi.',
    icon: FileCheck2,
  },
  {
    title: 'Maxfiylik va xavfsizlik',
    text: 'Suhbatlar, hujjatlar va jarayonlar nazoratli kanal orqali yuritiladi.',
    icon: LockKeyhole,
  },
];

const FLOW = [
  {
    title: '1. Ro\'yxatdan o\'tish',
    text: 'Foydalanuvchi kabinet ochadi va murojaatni chat orqali boshlaydi.',
  },
  {
    title: '2. AI triage',
    text: 'Masala turi, shoshilinchlik va kerakli hujjatlar bo\'yicha boshlang\'ich yo\'nalish beriladi.',
  },
  {
    title: '3. Advokatga yo\'naltirish',
    text: 'Tanlangan yo\'nalish bo\'yicha advokatga murojaat va fayllar avtomatik biriktiriladi.',
  },
  {
    title: '4. Nazorat va natija',
    text: 'Jarayon holati, to\'lov va hujjatlar bir kabinet ichida boshqariladi.',
  },
];

function StatCard({ label, value, icon: Icon, loading }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <Icon size={20} className="text-[var(--color-primary)]" />
      {loading ? (
        <div className="mt-3 space-y-2 animate-pulse">
          <div className="h-8 w-20 rounded bg-slate-100" />
          <div className="h-4 w-32 rounded bg-slate-100" />
        </div>
      ) : (
        <>
          <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          <p className="mt-1 text-sm text-slate-600">{label}</p>
        </>
      )}
    </div>
  );
}

export default function About() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      const payload = await loadPlatformStats();
      if (!active) return;
      setStats(payload);
      setLoading(false);
    };

    run();
    return () => {
      active = false;
    };
  }, []);

  const kpis = useMemo(() => {
    const totalUsers = Number(stats?.totalUsers || 0);
    const totalLawyers = Number(stats?.totalLawyers || 0);
    const resolvedCases = Number(stats?.resolvedCases || 0);

    const resolvedRate = totalUsers > 0
      ? `${Math.min(100, Math.round((resolvedCases / totalUsers) * 100))}%`
      : '0%';

    return {
      users: totalUsers > 0 ? `${totalUsers}+` : '0',
      lawyers: totalLawyers > 0 ? `${totalLawyers}+` : '0',
      resolved: resolvedCases > 0 ? `${resolvedCases}+` : '0',
      resolvedRate,
    };
  }, [stats?.resolvedCases, stats?.totalLawyers, stats?.totalUsers]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="pt-32 pb-16 md:pt-36 md:pb-20 bg-[linear-gradient(180deg,#eef4fb_0%,#f8fafc_100%)] border-b border-slate-200">
        <div className="section-wrap grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-start">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-primary-300)] bg-white text-[var(--color-primary)] text-xs font-semibold">
              <ShieldCheck size={14} />
              LegalLink haqida
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold text-slate-900 leading-tight">
              Ishonchli yuridik platforma
              <span className="text-[var(--color-primary)]"> real mutaxassislar</span>
              {' '}bilan
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-3xl leading-relaxed">
              LegalLink foydalanuvchini AI tahlil orqali tez yo\'naltiradi va kerakli holatda tajribali advokat bilan
              birlashtiradi. Maqsadimiz: huquqiy jarayonni tez, shaffof va boshqariladigan qilish.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to="/chat/ai">
                <Button className="px-7 h-12 text-sm">
                  AI bilan boshlash
                </Button>
              </Link>
              <Link to="/lawyers">
                <Button variant="outline" className="px-7 h-12 text-sm">
                  Advokatlar ro\'yxati
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <StatCard label="Ro\'yxatdan o\'tgan foydalanuvchi" value={kpis.users} loading={loading} icon={Users2} />
            <StatCard label="Faol advokatlar" value={kpis.lawyers} loading={loading} icon={Scale} />
            <StatCard label="Yakunlangan ishlar" value={kpis.resolved} loading={loading} icon={BadgeCheck} />
            <StatCard label="Ijobiy hal ko\'rsatkich" value={kpis.resolvedRate} loading={loading} icon={Handshake} />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="section-wrap">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Nima uchun bizga ishonishadi</h2>
          <p className="mt-3 text-slate-600 max-w-3xl">
            Platforma faqat vizual emas, amaliy ish jarayoniga qurilgan: murojaat, hujjat, chat va nazorat bir tizimda.
          </p>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            {TRUST_POINTS.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="w-11 h-11 rounded-xl bg-[var(--color-primary-50)] inline-flex items-center justify-center">
                  <item.icon size={20} className="text-[var(--color-primary)]" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white border-y border-slate-200">
        <div className="section-wrap">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Ishlash jarayoni</h2>
          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FLOW.map((step) => (
              <div key={step.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="section-wrap">
          <div className="rounded-3xl border border-slate-200 bg-[var(--color-surface-900)] text-white p-8 md:p-12">
            <h2 className="text-3xl md:text-5xl font-bold">Yuridik masalangizni tizimli hal qilamiz</h2>
            <p className="mt-4 text-slate-200 max-w-3xl">
              Boshlanish AI orqali bepul. Jonli advokat bilan ishlash bosqichi obuna yo\'li bilan faollashadi va
              jarayon real kabinetlarda davom etadi.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to="/chat/ai">
                <Button className="px-7 h-12 text-sm">Chatni ochish</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="px-7 h-12 text-sm border-slate-500 text-white hover:bg-white/10">
                  Aloqa markazi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
