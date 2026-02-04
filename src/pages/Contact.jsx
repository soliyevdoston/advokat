import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Button from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';

export default function Contact() {
  const { t } = useLanguage();

  return (
    <div className="pt-32 pb-20 bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6">{t('contact_page.title')}</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t('contact_page.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info & Map */}
          <div className="space-y-8">
            <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700">
               <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('contact_page.info.title')}</h3>
               <div className="space-y-6">
                 <div className="flex items-start gap-4 group">
                   <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-[var(--color-primary)] dark:text-blue-400 group-hover:scale-110 transition-transform">
                     <MapPin size={24} />
                   </div>
                   <div>
                     <p className="font-bold text-slate-900 dark:text-white mb-1">{t('contact_page.info.address_title')}</p>
                     <p className="text-slate-600 dark:text-slate-300">{t('contact_page.info.address_desc')}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-4 group">
                   <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                     <Phone size={24} />
                   </div>
                   <div>
                     <p className="font-bold text-slate-900 dark:text-white mb-1">{t('contact_page.info.call_title')}</p>
                     <p className="text-slate-600 dark:text-slate-300">{t('contact_page.info.call_desc')}</p>
                     <p className="text-slate-600 dark:text-slate-400 text-sm">{t('contact_page.info.hours')}</p>
                   </div>
                 </div>

                 <div className="flex items-start gap-4 group">
                   <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                     <Mail size={24} />
                   </div>
                   <div>
                     <p className="font-bold text-slate-900 dark:text-white mb-1">{t('contact_page.info.email_title')}</p>
                     <p className="text-slate-600 dark:text-slate-300">info@advokat.uz</p>
                     <p className="text-slate-600 dark:text-slate-300">support@advokat.uz</p>
                   </div>
                 </div>
               </div>
            </div>

            {/* Map Placeholder */}
            <div className="h-80 bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden relative border border-slate-200 dark:border-slate-700">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" 
                alt="Map location" 
                className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-white/30 dark:bg-black/30 backdrop-blur-sm">
                <Button variant="outline" className="bg-white/80 dark:bg-slate-900/80 backdrop-blur pointer-events-none dark:text-white dark:border-slate-600">
                  <MapPin size={18} className="mr-2 text-[var(--color-primary)] dark:text-blue-400" />
                  {t('contact_page.map_btn')}
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 dark:bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10"></div>
            
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{t('contact_page.form.title')}</h3>
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              alert(t('contact_page.form.success'));
              e.target.reset();
            }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('contact_page.form.name')}</label>
                  <input required type="text" placeholder={t('contact_page.form.name_ph')} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('contact_page.form.phone')}</label>
                  <input required type="tel" placeholder="+998 90 123 45 67" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('contact_page.form.email')}</label>
                <input required type="email" placeholder="example@gmail.com" className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('contact_page.form.subject')}</label>
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-600 dark:text-slate-300">
                  <option className="dark:bg-slate-900">{t('contact_page.form.subjects.general')}</option>
                  <option className="dark:bg-slate-900">{t('contact_page.form.subjects.tech')}</option>
                  <option className="dark:bg-slate-900">{t('contact_page.form.subjects.coop')}</option>
                  <option className="dark:bg-slate-900">{t('contact_page.form.subjects.complaint')}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('contact_page.form.message')}</label>
                <textarea required rows="4" placeholder={t('contact_page.form.message_ph')} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white dark:focus:bg-slate-800 dark:text-white transition-all resize-none"></textarea>
              </div>

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
