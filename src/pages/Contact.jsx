import React, { useMemo, useState } from 'react';
import { CalendarClock, Mail, MapPin, Phone, Send } from 'lucide-react';
import Button from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';

const LAWYER_AVAILABILITY_KEY = 'legallink_lawyer_availability_v1';
const CONTACT_BOOKINGS_KEY = 'legallink_contact_bookings_v1';

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

const toTimestamp = (date, time) => new Date(`${date}T${time}`).getTime();

export default function Contact() {
  const { t } = useLanguage();
  const [notice, setNotice] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'general',
    message: '',
  });

  const availableSlots = useMemo(() => {
    const map = readJSON(LAWYER_AVAILABILITY_KEY, {});
    const flattened = [];

    Object.entries(map).forEach(([owner, slots]) => {
      if (!Array.isArray(slots)) return;
      slots.forEach((slot) => {
        if (!slot?.date || !slot?.start || !slot?.end) return;
        flattened.push({
          id: `${owner}_${slot.id || `${slot.date}_${slot.start}`}`,
          owner,
          date: slot.date,
          start: slot.start,
          end: slot.end,
        });
      });
    });

    return flattened
      .sort((a, b) => toTimestamp(a.date, a.start) - toTimestamp(b.date, b.start))
      .slice(0, 8);
  }, [notice]);

  const handleBookSlot = (slot) => {
    const bookings = readJSON(CONTACT_BOOKINGS_KEY, []);
    const entry = {
      id: `booking_${Date.now()}`,
      slotId: slot.id,
      lawyer: slot.owner,
      date: slot.date,
      start: slot.start,
      end: slot.end,
      name: formData.name || null,
      phone: formData.phone || null,
      createdAt: new Date().toISOString(),
    };

    writeJSON(CONTACT_BOOKINGS_KEY, [entry, ...bookings]);
    setSelectedSlotId(slot.id);
    setFormData((prev) => ({
      ...prev,
      subject: 'consultation',
      message: `${prev.message}\n\nSlot broni: ${slot.date} ${slot.start}-${slot.end} (advokat: ${slot.owner})`.trim(),
    }));
    setNotice(`Slot tanlandi: ${slot.date} ${slot.start}-${slot.end}`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const submissions = readJSON('legallink_contact_requests_v1', []);
    const payload = {
      ...formData,
      selectedSlotId: selectedSlotId || null,
      createdAt: new Date().toISOString(),
    };
    writeJSON('legallink_contact_requests_v1', [payload, ...submissions]);

    setNotice(t('contact_page.form.success'));
    setFormData({
      name: '',
      phone: '',
      email: '',
      subject: 'general',
      message: '',
    });
    setSelectedSlotId('');
  };

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6">{t('contact_page.title')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t('contact_page.subtitle')}
          </p>
        </div>

        {notice && (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
            {notice}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Aloqa ma'lumotlari</h3>
              <div className="space-y-6">
                <InfoRow
                  icon={<MapPin size={24} />}
                  title={t('contact_page.info.address_title')}
                  body={<p className="text-slate-600 dark:text-slate-300">{t('contact_page.info.address_desc')}</p>}
                  iconClass="bg-blue-100 dark:bg-blue-900/30 text-[var(--color-primary)] dark:text-blue-400"
                />
                <InfoRow
                  icon={<Phone size={24} />}
                  title={t('contact_page.info.call_title')}
                  body={(
                    <>
                      <p className="text-slate-600 dark:text-slate-300">{t('contact_page.info.call_desc')}</p>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{t('contact_page.info.hours')}</p>
                    </>
                  )}
                  iconClass="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                />
                <InfoRow
                  icon={<Mail size={24} />}
                  title={t('contact_page.info.email_title')}
                  body={(
                    <>
                      <p className="text-slate-600 dark:text-slate-300">info@advokat.uz</p>
                      <p className="text-slate-600 dark:text-slate-300">support@advokat.uz</p>
                    </>
                  )}
                  iconClass="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 inline-flex items-center gap-2">
                <CalendarClock size={18} className="text-blue-600" />
                Tezkor uchrashuv slotlari
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Advokatlar kabinetda belgilagan eng yaqin bo‘sh vaqtlar.
              </p>

              {availableSlots.length === 0 ? (
                <p className="text-sm text-slate-500">Hozircha bo‘sh slotlar yo‘q.</p>
              ) : (
                <div className="space-y-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => handleBookSlot(slot)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                        selectedSlotId === slot.id
                          ? 'border-blue-300 bg-blue-50 text-blue-700'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      <p className="font-semibold">{slot.date} • {slot.start}-{slot.end}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Advokat: {slot.owner}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('contact_page.form.title')}</h3>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <Field label={t('contact_page.form.name')}>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder={t('contact_page.form.name_ph')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:text-white"
                  />
                </Field>
                <Field label={t('contact_page.form.phone')}>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                    placeholder="+998 90 123 45 67"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:text-white"
                  />
                </Field>
              </div>

              <Field label={t('contact_page.form.email')}>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="example@gmail.com"
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:text-white"
                />
              </Field>

              <Field label={t('contact_page.form.subject')}>
                <select
                  value={formData.subject}
                  onChange={(event) => setFormData((prev) => ({ ...prev, subject: event.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-slate-600 dark:text-slate-300"
                >
                  <option value="general" className="dark:bg-slate-900">{t('contact_page.form.subjects.general')}</option>
                  <option value="tech" className="dark:bg-slate-900">{t('contact_page.form.subjects.tech')}</option>
                  <option value="coop" className="dark:bg-slate-900">{t('contact_page.form.subjects.coop')}</option>
                  <option value="complaint" className="dark:bg-slate-900">{t('contact_page.form.subjects.complaint')}</option>
                  <option value="consultation" className="dark:bg-slate-900">Uchrashuv/maslahat</option>
                </select>
              </Field>

              <Field label={t('contact_page.form.message')}>
                <textarea
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(event) => setFormData((prev) => ({ ...prev, message: event.target.value }))}
                  placeholder={t('contact_page.form.message_ph')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] dark:text-white resize-none"
                />
              </Field>

              <Button className="w-full py-4 text-lg btn-primary shadow-lg shadow-blue-900/20 dark:shadow-none">
                {t('contact_page.form.submit')} <Send size={20} className="ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, title, body, iconClass }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${iconClass}`}>
        {icon}
      </div>
      <div>
        <p className="font-bold text-slate-900 dark:text-white mb-1">{title}</p>
        {body}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      {children}
    </label>
  );
}
