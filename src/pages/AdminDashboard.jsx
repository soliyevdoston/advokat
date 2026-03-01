import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, getAllUsers, createAdmin } = useAuth();
  
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Admin yaratish formasi statelari
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Barcha foydalanuvchilarni yuklash
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      // Faraz qilamizki, backend ma'lumotlarni massiv yoki { users: [] } ko'rinishida qaytaradi
      const list = Array.isArray(data) ? data : (data.users || data.data || []);
      setUsersList(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(false);

    try {
      await createAdmin(newAdminEmail, newAdminPassword);
      setCreateSuccess(true);
      setNewAdminEmail('');
      setNewAdminPassword('');
      // Yangi admin qo'shilgach, ro'yxatni yangilaymiz
      fetchUsers();
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
      // Muvaffaqiyatli xabarni 3 soniyadan keyin o'chirish
      if (!createError) {
        setTimeout(() => setCreateSuccess(false), 3000);
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 dark:text-white mb-2">
              Admin Panel
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Tizim foydalanuvchilarini boshqarish va yangi adminlar qo'shish
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-sm">
            Tizimga kirdi: <span className="font-bold text-[var(--color-primary)]">{user?.email || 'Noma\'lum'}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Chap ustun: Admin qo'shish formasi */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm sticky top-24"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-[var(--color-primary)] dark:text-blue-400">
                  <UserPlus size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Yangi Admin</h2>
              </div>

              {createError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex gap-2">
                  <ShieldAlert size={16} className="mt-0.5 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {createSuccess && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm flex gap-2 items-center">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>Muvaffaqiyatli yaratildi!</span>
                </div>
              )}

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">
                    Email manzil
                  </label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@mail.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-colors dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 ml-1">
                    Parol
                  </label>
                  <input
                    type="password"
                    required
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 transition-colors dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="w-full py-3.5 bg-[var(--color-primary)] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center mt-2"
                >
                  {createLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    "Adminni saqlash"
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          {/* O'ng ustun: Foydalanuvchilar ro'yxati */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-[var(--color-primary)] dark:text-blue-400">
                    <Users size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Foydalanuvchilar</h2>
                    <p className="text-sm text-slate-500">Jami: {usersList.length} ta</p>
                  </div>
                </div>
                <button 
                  onClick={fetchUsers}
                  disabled={loading}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Yangilash
                </button>
              </div>

              {error ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-800">
                  <p className="font-bold">Xatolik yuz berdi:</p>
                  <p className="text-sm">{error}</p>
                </div>
              ) : loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 size={40} className="animate-spin mb-4 text-[var(--color-primary)]" />
                  <p>Yuklanmoqda...</p>
                </div>
              ) : usersList.length === 0 ? (
                <div className="py-16 text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  Foydalanuvchilar topilmadi
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm">
                        <th className="pb-3 px-4 font-medium">№</th>
                        <th className="pb-3 px-4 font-medium">Email</th>
                        <th className="pb-3 px-4 font-medium">Roli</th>
                        <th className="pb-3 px-4 font-medium">Yaratilgan sana</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {usersList.map((usr, i) => (
                        <tr key={usr.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                          <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                            {i + 1}
                          </td>
                          <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-200">
                            {usr.email}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${
                              usr.role === 'admin' 
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' 
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}>
                              {usr.role || 'user'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                            {usr.created_at ? new Date(usr.created_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
