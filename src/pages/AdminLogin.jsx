import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, LockKeyhole, Shield, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, login, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const session = await login(email.trim(), password.trim());

      if (session?.user?.role !== 'admin') {
        logout();
        setError('Bu bo‘lim faqat adminlar uchun. Admin login bilan kiring.');
        return;
      }

      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/50 border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 mb-6">
            <Shield size={14} /> Admin Security Zone
          </div>

          <h1 className="text-3xl lg:text-4xl font-serif font-bold mb-4 leading-tight">
            LegalLink
            <br />
            Admin Kirish
          </h1>

          <p className="text-slate-300 mb-8 text-sm lg:text-base">
            Bu panel orqali foydalanuvchilar, advokatlar, chatlar va sayt kontenti boshqariladi.
            Faqat admin akkount uchun ruxsat beriladi.
          </p>
        </div>

        <div className="p-8 lg:p-10">
          <h2 className="text-2xl font-bold mb-6">Admin hisobga kirish</h2>

          {error && (
            <div className="mb-5 p-3 rounded-xl border border-red-700/60 bg-red-900/20 text-red-300 text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">Admin email</label>
              <div className="relative">
                <UserRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@mail.com"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">Parol</label>
              <div className="relative">
                <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {loading ? 'Tekshirilmoqda...' : 'Admin panelga kirish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
