import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Button from '../components/ui/Button';

export default function Contact() {
  return (
    <div className="pt-32 pb-20 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-6">Biz bilan bog'laning</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Savollaringiz bormi yoki yordam kerakmi? Bizning jamoamiz sizga yordam berishga tayyor.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info & Map */}
          <div className="space-y-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
               <h3 className="text-xl font-bold text-slate-900 mb-6">Aloqa ma'lumotlari</h3>
               <div className="space-y-6">
                 <div className="flex items-start gap-4 group">
                   <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-[var(--color-primary)] group-hover:scale-110 transition-transform">
                     <MapPin size={24} />
                   </div>
                   <div>
                     <p className="font-bold text-slate-900 mb-1">Manzil</p>
                     <p className="text-slate-600">Toshkent sh., Yunusobod tumani,<br/>Amir Temur ko'chasi, 108-uy</p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-4 group">
                   <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                     <Phone size={24} />
                   </div>
                   <div>
                     <p className="font-bold text-slate-900 mb-1">Call-markaz</p>
                     <p className="text-slate-600">Qisqa raqam: 1144</p>
                     <p className="text-slate-600 text-sm">Dushanba - Shanba, 9:00 - 18:00</p>
                   </div>
                 </div>

                 <div className="flex items-start gap-4 group">
                   <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                     <Mail size={24} />
                   </div>
                   <div>
                     <p className="font-bold text-slate-900 mb-1">Email</p>
                     <p className="text-slate-600">info@advokat.uz</p>
                     <p className="text-slate-600">support@advokat.uz</p>
                   </div>
                 </div>
               </div>
            </div>

            {/* Map Placeholder */}
            <div className="h-80 bg-slate-100 rounded-3xl overflow-hidden relative border border-slate-200">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000" 
                alt="Map location" 
                className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm">
                <Button variant="outline" className="bg-white/80 backdrop-blur pointer-events-none">
                  <MapPin size={18} className="mr-2 text-[var(--color-primary)]" />
                  Xaritada ko'rish
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 -z-10"></div>
            
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Xabar qoldirish</h3>
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault();
              alert("Xabaringiz muvaffaqiyatli yuborildi! Tez orada siz bilan bog'lanamiz.");
              e.target.reset();
            }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Ismingiz</label>
                  <input required type="text" placeholder="Ismingizni kiriting" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Telefon raqam</label>
                  <input required type="tel" placeholder="+998 90 123 45 67" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email manzili</label>
                <input required type="email" placeholder="example@gmail.com" className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Mavzu</label>
                <select className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all text-slate-600">
                  <option>Umumiy savollar</option>
                  <option>Texnik yordam</option>
                  <option>Hamkorlik</option>
                  <option>Shikoyat va takliflar</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Xabar matni</label>
                <textarea required rows="4" placeholder="Xabaringizni yozing..." className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white transition-all resize-none"></textarea>
              </div>

              <Button className="w-full py-4 text-lg btn-primary shadow-lg shadow-blue-900/20">
                Yuborish <Send size={20} className="ml-2" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
