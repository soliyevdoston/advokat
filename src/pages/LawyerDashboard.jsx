import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  Download,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TimerReset,
  UserCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import SupportChat from '../components/chat/SupportChat';
import '../styles/panels-minimal.css';

const LOCAL_APPLICATIONS_KEY = 'legallink_user_applications_v1';
const LAWYER_AVAILABILITY_KEY = 'legallink_lawyer_availability_v1';
const LAWYER_NOTES_KEY = 'legallink_lawyer_notes_v1';
const LAWYER_PREFERENCES_KEY = 'legallink_lawyer_preferences_v1';
const ADMIN_ANNOUNCEMENTS_KEY = 'legallink_admin_announcements_v1';

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const SECTIONS = [
  { key: 'overview', label: 'Boshqaruv', icon: LayoutDashboard },
  { key: 'applications', label: 'Arizalar', icon: ListChecks },
  { key: 'schedule', label: 'Bo\'sh vaqtlar', icon: CalendarClock },
  { key: 'chat', label: 'Chat', icon: MessageSquare },
  { key: 'profile', label: 'Profil', icon: UserCircle2 },
];

const APPLICATION_STATUSES = [
  { value: 'all', label: 'Barchasi' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_review', label: 'In review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const WORK_STATUS_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'busy', label: 'Bandman' },
  { value: 'offline', label: 'Offline' },
];

const getLawyerKey = (user) => String(user?.lawyerId || user?.email || user?.id || '').trim();

const statusBadgeClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'resolved') return 'bg-emerald-100 text-emerald-700';
  if (normalized === 'closed') return 'bg-slate-100 text-slate-600';
  if (normalized === 'in_review') return 'bg-blue-100 text-blue-700';
  return 'bg-amber-100 text-amber-700';
};

const isUrgentApplication = (item) => {
  const text = `${item?.title || ''} ${item?.description || ''} ${item?.text || ''}`.toLowerCase();
  const urgentWord = text.includes('shoshilinch') || text.includes('urgent') || text.includes('tezkor');
  const created = item?.createdAt || item?.created_at || item?.submittedAt;
  if (!created) return urgentWord;
  const ageMs = Date.now() - new Date(created).getTime();
  const olderThan3Days = Number.isFinite(ageMs) && ageMs > 3 * 24 * 60 * 60 * 1000;
  return urgentWord || olderThan3Days;
};

const toCsvCell = (value) => {
  const safe = String(value ?? '');
  if (safe.includes('"') || safe.includes(',') || safe.includes('\n')) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
};

const downloadCsv = (rows, fileName) => {
  const content = rows.map((row) => row.map(toCsvCell).join(',')).join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 600);
};

export default function LawyerDashboard() {
  const navigate = useNavigate();
  const { user, logout, listSupportConversations, safeError } = useAuth();

  const lawyerKey = useMemo(() => getLawyerKey(user), [user]);
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [applications, setApplications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [notesMap, setNotesMap] = useState({});
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workStatus, setWorkStatus] = useState('online');
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [onlyChatApproved, setOnlyChatApproved] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [slotForm, setSlotForm] = useState({
    date: '',
    start: '09:00',
    end: '10:00',
  });

  const notesKey = useMemo(() => `${lawyerKey || 'lawyer'}::notes`, [lawyerKey]);

  const loadData = useCallback(async () => {
    if (!lawyerKey) return;

    setLoading(true);
    setError('');

    try {
      const allApplications = readJSON(LOCAL_APPLICATIONS_KEY, []);
      const myApplications = allApplications.filter((item) => {
        const assignedId = String(item?.assignedLawyerId || item?.lawyerId || '').trim();
        const assignedEmail = String(item?.assignedLawyerEmail || item?.lawyerEmail || '').trim().toLowerCase();
        return assignedId === lawyerKey || assignedEmail === String(user?.email || '').toLowerCase();
      });
      setApplications(myApplications);

      const availabilityMap = readJSON(LAWYER_AVAILABILITY_KEY, {});
      setSlots(Array.isArray(availabilityMap[lawyerKey]) ? availabilityMap[lawyerKey] : []);

      const allNotes = readJSON(LAWYER_NOTES_KEY, {});
      setNotesMap(allNotes[notesKey] || {});

      const preferencesMap = readJSON(LAWYER_PREFERENCES_KEY, {});
      const prefs = preferencesMap[lawyerKey] || {};
      setWorkStatus(String(prefs.workStatus || 'online'));
      setOnlyUrgent(Boolean(prefs.onlyUrgent));
      setOnlyChatApproved(Boolean(prefs.onlyChatApproved));

      const allAnnouncements = readJSON(ADMIN_ANNOUNCEMENTS_KEY, []);
      const scopedAnnouncements = Array.isArray(allAnnouncements)
        ? allAnnouncements.filter((item) => ['all', 'lawyers'].includes(String(item?.target || 'all'))).slice(0, 6)
        : [];
      setAnnouncements(scopedAnnouncements);

      const chatList = await listSupportConversations();
      setConversations(Array.isArray(chatList) ? chatList : []);
    } catch (err) {
      setError(safeError(err, "Advokat kabinet ma'lumotlarini yuklashda xatolik"));
    } finally {
      setLoading(false);
    }
  }, [lawyerKey, listSupportConversations, notesKey, safeError, user?.email]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const pendingApplications = applications.filter((item) => !['resolved', 'closed'].includes(String(item?.status || '').toLowerCase())).length;
    const pendingChatApprovals = applications.filter((item) => item?.chatApproved === false).length;
    const activeChats = conversations.filter((item) => String(item?.status || '').toLowerCase() !== 'closed').length;
    const urgentApplications = applications.filter((item) => isUrgentApplication(item) && !['resolved', 'closed'].includes(String(item?.status || '').toLowerCase())).length;

    return {
      pendingApplications,
      pendingChatApprovals,
      activeChats,
      slots: slots.length,
      urgentApplications,
    };
  }, [applications, conversations, slots.length]);

  const filteredApplications = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return applications.filter((item) => {
      const status = String(item?.status || 'assigned').toLowerCase();
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      if (!matchesStatus) return false;

      if (onlyUrgent && !isUrgentApplication(item)) return false;
      if (onlyChatApproved && item?.chatApproved === false) return false;

      if (!query) return true;
      const haystack = `${item?.title || ''} ${item?.subject || ''} ${item?.description || ''} ${item?.text || ''} ${item?.userEmail || ''} ${item?.clientEmail || ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [applications, onlyChatApproved, onlyUrgent, searchText, statusFilter]);

  const upcomingSlots = useMemo(() => {
    return slots
      .map((slot) => ({
        ...slot,
        dateTime: new Date(`${slot.date}T${slot.start}`),
      }))
      .filter((slot) => Number.isFinite(slot.dateTime.getTime()) && slot.dateTime.getTime() >= Date.now())
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
      .slice(0, 5);
  }, [slots]);

  const progress = useMemo(() => {
    const total = applications.length || 1;
    const resolved = applications.filter((item) => ['resolved', 'closed'].includes(String(item?.status || '').toLowerCase())).length;
    return Math.round((resolved / total) * 100);
  }, [applications]);

  const averageResolutionDays = useMemo(() => {
    const resolved = applications.filter((item) => ['resolved', 'closed'].includes(String(item?.status || '').toLowerCase()));
    if (!resolved.length) return null;
    const days = resolved.map((item) => {
      const created = new Date(item?.createdAt || item?.created_at || item?.submittedAt || Date.now()).getTime();
      const updated = new Date(item?.lawyerUpdatedAt || item?.updatedAt || Date.now()).getTime();
      if (!Number.isFinite(created) || !Number.isFinite(updated) || updated < created) return 0;
      return (updated - created) / (24 * 60 * 60 * 1000);
    });
    const avg = days.reduce((sum, value) => sum + value, 0) / days.length;
    return Number(avg.toFixed(1));
  }, [applications]);

  const persistPreferences = useCallback((patch) => {
    if (!lawyerKey) return;
    const map = readJSON(LAWYER_PREFERENCES_KEY, {});
    map[lawyerKey] = {
      ...(map[lawyerKey] || {}),
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    writeJSON(LAWYER_PREFERENCES_KEY, map);
  }, [lawyerKey]);

  useEffect(() => {
    persistPreferences({
      workStatus,
      onlyUrgent,
      onlyChatApproved,
    });
  }, [onlyChatApproved, onlyUrgent, persistPreferences, workStatus]);

  const persistSlots = (nextSlots) => {
    setSlots(nextSlots);
    const availabilityMap = readJSON(LAWYER_AVAILABILITY_KEY, {});
    availabilityMap[lawyerKey] = nextSlots;
    writeJSON(LAWYER_AVAILABILITY_KEY, availabilityMap);
  };

  const persistNotes = (nextNotes) => {
    setNotesMap(nextNotes);
    const allNotes = readJSON(LAWYER_NOTES_KEY, {});
    allNotes[notesKey] = nextNotes;
    writeJSON(LAWYER_NOTES_KEY, allNotes);
  };

  const updateApplicationStatus = (id, status) => {
    const all = readJSON(LOCAL_APPLICATIONS_KEY, []);
    const next = all.map((item) => {
      if (String(item.id || item._id) !== String(id)) return item;
      return {
        ...item,
        status,
        lawyerUpdatedAt: new Date().toISOString(),
      };
    });
    writeJSON(LOCAL_APPLICATIONS_KEY, next);

    setApplications((prev) => prev.map((item) => (
      String(item.id || item._id) === String(id) ? { ...item, status } : item
    )));
    setNotice(`Ariza holati yangilandi: ${status}`);
  };

  const saveApplicationNote = (id, note) => {
    const cleaned = String(note || '').trim();
    const next = {
      ...notesMap,
      [id]: cleaned,
    };
    persistNotes(next);
    setNotice('Ichki eslatma saqlandi');
  };

  const handleAddSlot = (event) => {
    event.preventDefault();
    if (!slotForm.date || !slotForm.start || !slotForm.end) {
      setError('Sana va vaqtlarni to\'liq kiriting');
      return;
    }
    if (slotForm.start >= slotForm.end) {
      setError('Boshlanish vaqti tugash vaqtidan kichik bo\'lishi kerak');
      return;
    }

    const overlapExists = slots.some((slot) => (
      slot.date === slotForm.date
      && !(slotForm.end <= slot.start || slotForm.start >= slot.end)
    ));

    if (overlapExists) {
      setError('Bu oraliqda allaqachon bo\'sh vaqt mavjud');
      return;
    }

    const newSlot = {
      id: `slot_${Date.now()}`,
      date: slotForm.date,
      start: slotForm.start,
      end: slotForm.end,
      status: 'available',
      createdAt: new Date().toISOString(),
    };

    const next = [newSlot, ...slots].sort(
      (a, b) => new Date(`${a.date}T${a.start}`).getTime() - new Date(`${b.date}T${b.start}`).getTime()
    );
    persistSlots(next);
    setSlotForm({ date: '', start: '09:00', end: '10:00' });
    setError('');
    setNotice('Bo\'sh vaqt muvaffaqiyatli qo\'shildi');
  };

  const applyQuickSlot = (start, end) => {
    setSlotForm((prev) => ({
      ...prev,
      start,
      end,
    }));
  };

  const handleDeleteSlot = (slotId) => {
    const next = slots.filter((slot) => String(slot.id) !== String(slotId));
    persistSlots(next);
    setNotice('Bo\'sh vaqt o\'chirildi');
  };

  const handleExportApplications = () => {
    const rows = [
      ['ID', 'Sarlavha', 'Mijoz', 'Holat', 'Chat ruxsati', 'Shoshilinch', 'Yaratilgan'],
      ...filteredApplications.map((item, idx) => ([
        String(item?.id || item?._id || idx),
        item?.title || item?.subject || 'Nomsiz ariza',
        item?.userEmail || item?.clientEmail || '-',
        item?.status || 'assigned',
        item?.chatApproved === false ? 'pending' : 'approved',
        isUrgentApplication(item) ? 'yes' : 'no',
        item?.createdAt || item?.created_at || item?.submittedAt || '-',
      ])),
    ];

    downloadCsv(rows, `lawyer_applications_${new Date().toISOString().slice(0, 10)}.csv`);
    setNotice('Arizalar CSV formatida yuklab olindi');
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="lawyer-dashboard-shell lawyer-panel-minimal min-h-screen pt-28 pb-20 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="section-wrap">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-6">
          <aside className="lg:sticky lg:top-28 self-start surface-card rounded-3xl p-4">
            <div className="px-2 pb-4 border-b border-slate-100 dark:border-slate-700">
              <p className="text-xs uppercase tracking-wide text-slate-500">Advokat panel</p>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Advokat'}</h2>
              <p className="text-xs text-slate-500 truncate">{user?.email || '-'}</p>
            </div>

            <div className="py-4 space-y-2">
              {SECTIONS.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveSection(item.key)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      active
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon size={17} />
                      {item.label}
                    </span>
                    {item.key === 'applications' && stats.pendingApplications > 0 && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'}`}>
                        {stats.pendingApplications}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-700">
              <Button variant="outline" onClick={loadData} className="w-full gap-2 justify-center">
                <RefreshCw size={16} /> Yangilash
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                <LogOut size={16} className="mr-2" /> Chiqish
              </Button>
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-5">
              <h1 className="text-3xl font-serif font-bold text-slate-900 dark:text-white">Advokat kabineti</h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">
                Arizalar, bo\'sh vaqtlar, chat va ish samaradorligi bir oynada.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}
            {notice && (
              <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
                {notice}
              </div>
            )}

            {announcements.length > 0 && (
              <div className="mb-5 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Admin e’lonlari</p>
                <div className="space-y-2">
                  {announcements.map((item) => (
                    <div key={item.id} className="rounded-xl border border-blue-200/80 dark:border-blue-800/70 bg-white/70 dark:bg-slate-900/40 px-3 py-2">
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-200 mt-1">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
              <StatBox icon={ShieldCheck} title="Jarayondagi ariza" value={stats.pendingApplications} />
              <StatBox icon={Clock3} title="Chat tasdiq kutmoqda" value={stats.pendingChatApprovals} />
              <StatBox icon={MessageSquare} title="Faol chat" value={stats.activeChats} />
              <StatBox icon={CalendarClock} title="Bo\'sh vaqtlar" value={stats.slots} />
              <StatBox icon={Sparkles} title="Shoshilinch ish" value={stats.urgentApplications} />
            </div>

            <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Joriy ish holati</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {WORK_STATUS_OPTIONS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setWorkStatus(item.value)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                          workStatus === item.value
                            ? item.value === 'online'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : item.value === 'busy'
                                ? 'bg-amber-100 text-amber-700 border-amber-200'
                                : 'bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2">
                    <p className="text-xs text-slate-500">Yakunlash tezligi</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {averageResolutionDays === null ? '-' : `${averageResolutionDays} kun`}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2">
                    <p className="text-xs text-slate-500">Ish yangilanishi</p>
                    <p className="font-bold text-slate-900 dark:text-white inline-flex items-center gap-1">
                      <TimerReset size={14} className="text-blue-500" />
                      Real-time
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 p-10 flex flex-col items-center text-slate-500">
                <RefreshCw size={30} className="animate-spin mb-3" />
                Yuklanmoqda...
              </div>
            ) : (
              <>
                {activeSection === 'overview' && (
                  <div className="grid xl:grid-cols-3 gap-5">
                    <Card title="Bugungi fokuslar" icon={Sparkles}>
                      <ul className="space-y-3 text-sm">
                        <li className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                          Arizalarni ko\'rib chiqish: <b>{stats.pendingApplications}</b> ta
                        </li>
                        <li className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                          Chat ruxsatini kutayotganlar: <b>{stats.pendingChatApprovals}</b> ta
                        </li>
                        <li className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                          Shoshilinch ishlar: <b>{stats.urgentApplications}</b> ta
                        </li>
                      </ul>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <Button type="button" variant="outline" onClick={() => setActiveSection('applications')}>Arizalar</Button>
                        <Button type="button" variant="outline" onClick={() => setActiveSection('schedule')}>Jadval</Button>
                      </div>
                    </Card>

                    <Card title="Yaqin bo\'sh vaqtlar" icon={CalendarClock}>
                      {upcomingSlots.length === 0 ? (
                        <Empty text="Hozircha yaqin bo\'sh vaqt yo\'q." compact />
                      ) : (
                        <div className="space-y-2">
                          {upcomingSlots.map((slot) => (
                            <div key={slot.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                              <p className="font-medium text-slate-900 dark:text-white">{slot.date}</p>
                              <p className="text-xs text-slate-500">{slot.start} - {slot.end}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>

                    <Card title="Ish samaradorligi" icon={CheckCircle2}>
                      <div className="space-y-3">
                        <p className="text-sm text-slate-600 dark:text-slate-300">Yakunlangan ishlar ulushi</p>
                        <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{progress}%</p>
                        <p className="text-xs text-slate-500">
                          Umumiy ariza: {applications.length} ta
                        </p>
                        <p className="text-xs text-slate-500">
                          O‘rtacha yakunlash: {averageResolutionDays === null ? '-' : `${averageResolutionDays} kun`}
                        </p>
                        <p className="text-xs text-slate-500">
                          Joriy status: <b className="text-slate-700 dark:text-slate-200">{WORK_STATUS_OPTIONS.find((item) => item.value === workStatus)?.label || workStatus}</b>
                        </p>
                      </div>
                    </Card>
                  </div>
                )}

                {activeSection === 'applications' && (
                  <Card title="Menga biriktirilgan arizalar" icon={ListChecks}>
                    <div className="grid md:grid-cols-[1fr_200px] gap-3 mb-4">
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchText}
                          onChange={(event) => setSearchText(event.target.value)}
                          placeholder="Ariza, email yoki matn bo\'yicha qidiring"
                          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 py-2.5 text-sm"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm"
                      >
                        {APPLICATION_STATUSES.map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setOnlyUrgent((prev) => !prev)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                            onlyUrgent
                              ? 'bg-rose-100 text-rose-700 border-rose-200'
                              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          Faqat shoshilinch
                        </button>
                        <button
                          type="button"
                          onClick={() => setOnlyChatApproved((prev) => !prev)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                            onlyChatApproved
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                              : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          Faqat chat ochiq
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportApplications}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Download size={13} />
                        CSV yuklash
                      </button>
                    </div>

                    {filteredApplications.length === 0 ? (
                      <Empty text="Filtrga mos ariza topilmadi." />
                    ) : (
                      <div className="space-y-3 max-h-[620px] overflow-auto pr-1">
                        {filteredApplications.map((item, idx) => {
                          const itemId = String(item.id || item._id || idx);
                          const note = notesMap[itemId] || '';
                          const urgent = isUrgentApplication(item);
                          const chatAllowed = item.chatApproved !== false;

                          return (
                            <div key={itemId} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-900 dark:text-white truncate">{item.title || item.subject || 'Nomsiz ariza'}</p>
                                  <p className="text-xs text-slate-500 mt-1">Mijoz: {item.userEmail || item.clientEmail || '-'}</p>
                                  <p className="text-[11px] text-slate-400 mt-1">
                                    Yaratilgan: {item.createdAt || item.created_at || item.submittedAt || '-'}
                                  </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {urgent && <span className="text-[11px] px-2 py-1 rounded-full bg-rose-100 text-rose-700">Shoshilinch</span>}
                                  <span className={`text-[11px] px-2 py-1 rounded-full ${
                                    urgent ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                                  }`}>
                                    Prioritet: {urgent ? 'Yuqori' : 'Normal'}
                                  </span>
                                  <span className={`text-[11px] px-2 py-1 rounded-full ${statusBadgeClass(item.status)}`}>
                                    {String(item.status || 'assigned')}
                                  </span>
                                  <select
                                    className="text-xs rounded-md bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 px-2 py-1"
                                    value={item.status || 'assigned'}
                                    onChange={(event) => updateApplicationStatus(item.id || item._id, event.target.value)}
                                  >
                                    <option value="assigned">assigned</option>
                                    <option value="in_review">in_review</option>
                                    <option value="resolved">resolved</option>
                                    <option value="closed">closed</option>
                                  </select>
                                </div>
                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{item.description || item.text || '-'}</p>

                              <div className="mt-3 grid lg:grid-cols-[1fr_auto] gap-2 items-start">
                                <textarea
                                  rows={2}
                                  defaultValue={note}
                                  onBlur={(event) => saveApplicationNote(itemId, event.target.value)}
                                  placeholder="Ichki eslatma (faqat sizga ko\'rinadi)"
                                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/chat/support')}
                                    disabled={!chatAllowed}
                                    className={!chatAllowed ? 'opacity-50 cursor-not-allowed' : ''}
                                  >
                                    Chatga o\'tish
                                  </Button>
                                </div>
                              </div>

                              <div className="mt-2">
                                <span className={`text-xs px-2 py-1 rounded-md ${
                                  chatAllowed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {chatAllowed ? 'Chat ruxsati bor' : 'Chat admin ruxsatini kutmoqda'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                )}

                {activeSection === 'schedule' && (
                  <div className="grid lg:grid-cols-2 gap-5">
                    <Card title="Bo\'sh vaqt qo\'shish" icon={CalendarClock}>
                      <form onSubmit={handleAddSlot} className="space-y-3">
                        <Field label="Sana">
                          <input
                            type="date"
                            value={slotForm.date}
                            onChange={(event) => setSlotForm((prev) => ({ ...prev, date: event.target.value }))}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm"
                            required
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Boshlanish">
                            <input
                              type="time"
                              value={slotForm.start}
                              onChange={(event) => setSlotForm((prev) => ({ ...prev, start: event.target.value }))}
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm"
                              required
                            />
                          </Field>
                          <Field label="Tugash">
                            <input
                              type="time"
                              value={slotForm.end}
                              onChange={(event) => setSlotForm((prev) => ({ ...prev, end: event.target.value }))}
                              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2.5 text-sm"
                              required
                            />
                          </Field>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <QuickSlotButton onClick={() => applyQuickSlot('09:00', '10:00')} label="09:00-10:00" />
                          <QuickSlotButton onClick={() => applyQuickSlot('14:00', '15:00')} label="14:00-15:00" />
                          <QuickSlotButton onClick={() => applyQuickSlot('17:00', '18:00')} label="17:00-18:00" />
                        </div>

                        <Button type="submit" className="btn-primary w-full">
                          <CheckCircle2 size={16} className="mr-2" /> Vaqt qo\'shish
                        </Button>
                      </form>
                    </Card>

                    <Card title="Belgilangan bo\'sh vaqtlar" icon={Clock3}>
                      {slots.length === 0 ? (
                        <Empty text="Bo\'sh vaqtlar hali qo\'shilmagan." />
                      ) : (
                        <div className="space-y-2 max-h-[460px] overflow-auto pr-1">
                          {slots.map((slot) => (
                            <div key={slot.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{slot.date}</p>
                                <p className="text-xs text-slate-500">{slot.start} - {slot.end}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="text-xs text-red-600 hover:text-red-700"
                              >
                                O\'chirish
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                )}

                {activeSection === 'chat' && (
                  <Card title="Mijozlar bilan chat" icon={MessageSquare}>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                      Chat faqat admin ruxsat bergan suhbatlarda ochiladi.
                    </p>
                    <SupportChat embedded />
                  </Card>
                )}

                {activeSection === 'profile' && (
                  <Card title="Profil va ish holati" icon={UserCircle2}>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <InfoRow label="Ism" value={user?.name || '-'} />
                      <InfoRow label="Email" value={user?.email || '-'} />
                      <InfoRow label="Role" value={user?.role || '-'} />
                      <InfoRow label="Lawyer ID" value={String(user?.lawyerId || '-')} />
                    </div>
                    <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-sm text-slate-600 dark:text-slate-300">
                      Profil ma'lumotlari admin panel orqali yangilanadi. Zarur bo'lsa administratorga murojaat qiling.
                    </div>
                  </Card>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children }) {
  const Icon = icon || ShieldCheck;

  return (
    <div className="surface-card rounded-3xl p-5">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 inline-flex items-center gap-2">
        <Icon size={18} className="text-[var(--color-primary)] dark:text-blue-400" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatBox({ icon, title, value }) {
  return (
    <div className="surface-card rounded-2xl p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center">
        {React.createElement(icon, { size: 20 })}
      </div>
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Empty({ text, compact = false }) {
  return (
    <div className={`${compact ? 'py-5' : 'py-10'} text-center text-sm text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl`}>
      {text}
    </div>
  );
}

function QuickSlotButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
    >
      {label}
    </button>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="font-semibold text-slate-900 dark:text-white mt-1 break-all">{value}</p>
    </div>
  );
}
