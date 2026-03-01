import React from 'react';
import { useParams } from 'react-router-dom';
import { lawyers } from '../data/lawyers';
import ChatInterface from '../components/chat/ChatInterface';

/**
 * ChatPage — /chat/:type va /chat/:type/:id
 *
 * type: 'ai' | 'support' | 'lawyer' | 'document'
 *  - ai       → Advokat AI yordamchisi
 *  - support  → Platforma mutaxassisi / admin vositachisi
 *  - lawyer   → Advokat bilan bog'lanish (admin orqali)
 *  - document → Hujjat generatori
 */
export default function ChatPage() {
  const { type, id } = useParams();

  let title    = 'Advokat yordamchisi';
  let subtitle = 'Savollaringizga javob beraman';
  let initial  = 'Assalomu alaykum! Sizga qanday yuridik yordam kerak?';
  let chatType = 'ai';

  if (type === 'support') {
    title    = 'Platforma Mutaxassisi';
    subtitle = 'Sizga mos advokat topishda yordam beraman';
    initial  = 'Assalomu alaykum! Men LegalLink platformasi mutaxassisiman. Sizga qanday yuridik yordam kerak? Muammoingizni qisqacha yozib qoldiring, biz siz uchun eng yaxshi advokatni topib beramiz.';
    chatType = 'expert';

  } else if (type === 'lawyer' && id) {
    const lawyer = lawyers.find(l => l.id === parseInt(id));
    if (lawyer) {
      title    = 'Platforma Admini';
      subtitle = `${lawyer.name} bilan bog'lanish bo'yicha`;
      initial  = `Assalomu alaykum! Siz advokat ${lawyer.name} bilan bog'lanmoqchisiz. Iltimos, ishingiz bo'yicha qisqacha ma'lumot bering. Biz so'rovingizni advokatga yetkazamiz va uchrashuv vaqtini belgilaymiz.`;
      chatType = 'expert';
    }

  } else if (type === 'document') {
    title    = 'Hujjatlar Generatori';
    subtitle = 'AI yordamida hujjat yarating';
    initial  = "Qanday hujjat tayyorlashimiz kerak? (Masalan: Ariza, Da'vo arizasi, Shartnoma)";
    chatType = 'document';
  }

  return (
    <div className="pt-28 pb-20 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChatInterface
          title={title}
          subtitle={subtitle}
          type={chatType}
          initialMessage={initial}
        />
      </div>
    </div>
  );
}
