import React, { useMemo } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { lawyers } from '../data/lawyers';
import ChatInterface from '../components/chat/ChatInterface';
import SupportChat from '../components/chat/SupportChat';
import { useAuth } from '../context/AuthContext';
import { clearQuickLegalCheck, readQuickLegalCheck } from '../utils/quickLegalCheck';

/**
 * ChatPage — /chat/:type va /chat/:type/:id
 *
 * type:
 * - ai       -> Advokat AI yordamchisi
 * - support  -> Mutaxassis / support chat
 * - lawyer   -> Advokat bo'yicha support chat
 * - document -> Hujjat generatori
 */
export default function ChatPage() {
  const { user } = useAuth();
  const location = useLocation();
  const { type, id } = useParams();
  const resolvedType = type || 'ai';
  const quickCheckPayload = useMemo(() => {
    if (!user) return null;
    const payload = readQuickLegalCheck();
    if (!payload?.target) return null;

    const targetPath = String(payload.target);
    const currentPath = `/chat/${resolvedType}`;
    const isMatch = targetPath === currentPath || (resolvedType === 'ai' && targetPath === '/chat/ai' && location.pathname === '/chat');
    if (!isMatch) return null;

    clearQuickLegalCheck();
    return payload;
  }, [location.pathname, resolvedType, user]);

  if (!user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{
          isLogin: false,
          from: { pathname: location.pathname },
          source: 'chat_gate',
        }}
      />
    );
  }

  if (resolvedType === 'support' || resolvedType === 'lawyer') {
    return (
      <div className="pt-28 pb-20 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SupportChat
            lawyerId={resolvedType === 'lawyer' ? id : null}
            bootstrapMessage={quickCheckPayload?.prompt || ''}
          />
        </div>
      </div>
    );
  }

  let title = 'Advokat yordamchisi';
  let subtitle = 'Savollaringizga javob beraman';
  let initial = 'Assalomu alaykum! Sizga qanday yuridik yordam kerak?';
  let chatType = 'ai';

  if (resolvedType === 'document') {
    title = 'Hujjatlar Generatori';
    subtitle = 'AI yordamida hujjat yarating (1 ta tekin)';
    initial = "Qanday hujjat tayyorlashimiz kerak? (Masalan: Ariza, Da'vo arizasi, Shartnoma)\n\nEslatma: har bir foydalanuvchi uchun 1 ta hujjat bepul.";
    chatType = 'document';
  } else if (resolvedType === 'lawyer' && id) {
    const lawyer = lawyers.find((item) => item.id === parseInt(id, 10));
    if (lawyer) {
      title = `Advokat ${lawyer.name} bo'yicha yordam`;
      subtitle = 'Platforma mutaxassisi bilan muloqot';
      initial = `Assalomu alaykum! Siz advokat ${lawyer.name} bo'yicha murojaat qoldirdingiz. Holatingizni batafsil yozib qoldiring.`;
      chatType = 'expert';
    }
  }

  return (
    <div className="pt-28 pb-20 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <ChatInterface
          title={title}
          subtitle={subtitle}
          type={chatType}
          initialMessage={initial}
          initialUserPrompt={quickCheckPayload?.prompt || ''}
          quickCheckTitle={quickCheckPayload?.recommendationTitle || ''}
        />
      </div>
    </div>
  );
}
