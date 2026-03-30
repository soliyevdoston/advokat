import React, { useMemo, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { CreditCard, Lock, Sparkles } from 'lucide-react';
import { lawyers } from '../data/lawyers';
import ChatInterface from '../components/chat/ChatInterface';
import SupportChat from '../components/chat/SupportChat';
import { useAuth } from '../context/AuthContext';
import { clearQuickLegalCheck, readQuickLegalCheck } from '../utils/quickLegalCheck';
import Button from '../components/ui/Button';
import { openPaymentGateway } from '../utils/paymentGate';
import {
  activateSubscription,
  createPendingSubscription,
  hasActiveSubscription,
} from '../utils/subscription';

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
  const [quickPrompt, setQuickPrompt] = useState('');
  const [gateVersion, setGateVersion] = useState(0);
  const [gateError, setGateError] = useState('');
  const quickCheckPayload = useMemo(() => {
    if (!user) return null;
    const payload = readQuickLegalCheck();
    if (!payload?.target) return null;

    const targetPath = String(payload.target).replace(/\/$/, '');
    const pathname = String(location.pathname || '').replace(/\/$/, '');
    const currentPath = `/chat/${resolvedType}`;
    const isMatch = (
      targetPath === pathname
      || targetPath === currentPath
      || (resolvedType === 'ai' && targetPath === '/chat/ai' && pathname === '/chat')
      || (resolvedType === 'lawyer' && pathname.startsWith('/chat/lawyer') && targetPath.startsWith('/chat/lawyer'))
    );
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

  const lawyerChatLocked = resolvedType === 'lawyer'
    && user?.role === 'user'
    && !hasActiveSubscription(user);

  if (lawyerChatLocked) {
    return (
      <LawyerSubscriptionGate
        onPaid={(gateway) => {
          setGateError('');
          createPendingSubscription({
            user,
            gateway,
            amount: 149000,
            plan: 'PRO',
          });
          const opened = openPaymentGateway({
            gateway,
            amount: 149000,
            plan: 'pro_lawyer_chat',
            userEmail: user?.email || '',
          });
          if (opened) {
            activateSubscription({
              user,
              gateway,
              amount: 149000,
              plan: 'PRO',
            });
            setGateVersion((prev) => prev + 1);
            return;
          }
          setGateError(`${gateway.toUpperCase()} to‘lov sozlanmagan. .env konfiguratsiyasini tekshiring.`);
        }}
        onRefresh={() => {
          setGateError('');
          setGateVersion((prev) => prev + 1);
        }}
        gateVersion={gateVersion}
        error={gateError}
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

  const quickTemplates = resolvedType === 'document'
    ? [
      "Menga da'vo arizasi shabloni kerak. Qanday ma'lumotlar zarur?",
      "Ijara shartnomasining xavfsiz variantini tuzib bering.",
      "Murojaat xatini rasmiy tilda tayyorlashga yordam bering.",
    ]
    : [
      'Mening holatim bo‘yicha bosqichma-bosqich yuridik reja tuzing.',
      'Qaysi hujjatlarni darhol tayyorlashim kerak?',
      'Muzokara va sudgacha hal qilish uchun strategiya bering.',
    ];

  return (
    <div className="pt-28 pb-20 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Tezkor promptlar:</p>
          <div className="flex flex-wrap gap-2">
            {quickTemplates.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuickPrompt(item)}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                  quickPrompt === item
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <ChatInterface
          title={title}
          subtitle={subtitle}
          type={chatType}
          initialMessage={initial}
          initialUserPrompt={quickPrompt || quickCheckPayload?.prompt || ''}
          quickCheckTitle={quickCheckPayload?.recommendationTitle || ''}
          quickCheckPayload={quickCheckPayload}
        />
      </div>
    </div>
  );
}

function LawyerSubscriptionGate({ onPaid, onRefresh, gateVersion, error }) {
  return (
    <div className="pt-28 pb-20 bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 md:p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-xs font-semibold">
            <Lock size={13} />
            Pro obuna talab qilinadi
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-serif font-bold text-slate-900 dark:text-white">
            Advokat bilan chatni boshlash uchun PRO obuna kerak
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            AI javobi bepul. Jonli advokat chatiga o‘tish Click/Payme to‘lovidan keyin avtomatik ochiladi.
          </p>

          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onPaid('click')}
              className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 inline-flex items-center justify-center gap-2"
            >
              <CreditCard size={16} />
              CLICK bilan to‘lash
            </button>
            <button
              type="button"
              onClick={() => onPaid('payme')}
              className="w-full px-4 py-3 rounded-xl bg-[#1f3bff] text-white font-semibold hover:opacity-90 inline-flex items-center justify-center gap-2"
            >
              <CreditCard size={16} />
              PAYME bilan to‘lash
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={onRefresh} className="text-sm">
              To‘lov holatini yangilash
            </Button>
            <span className="text-xs text-slate-500 dark:text-slate-400 inline-flex items-center gap-1">
              <Sparkles size={12} />
              Holat tekshiruvi: #{gateVersion}
            </span>
          </div>
          {error && (
            <p className="mt-3 text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
