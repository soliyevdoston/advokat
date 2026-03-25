import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import { Send, Paperclip, Bot, User, MoreVertical, Phone, Video, Search, Smile, Loader2, AlertCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { buildApiUrl } from '../../config/appConfig';
import { DOCUMENT_FREE_QUOTA_KEY } from '../../utils/documentQuota';
import { saveQuickLegalCheck } from '../../utils/quickLegalCheck';
import { lawyers } from '../../data/lawyers';
const MotionDiv = motion.div;

// Chat turlariga mos endpoint
const CHAT_ENDPOINTS = {
  ai: '/chat/ai',
  document: '/chat/ai',
  expert: '/chat/support',
  lawyer: '/chat/support',
};

const normalizeSources = (rawSources) => {
  if (!Array.isArray(rawSources)) return [];

  return rawSources
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: `src_${index}`,
          title: item,
          url: null,
        };
      }

      if (item && typeof item === 'object') {
        return {
          id: item.id || `src_${index}`,
          title: item.title || item.label || item.name || item.url || `Manba ${index + 1}`,
          url: item.url || item.link || null,
        };
      }

      return null;
    })
    .filter(Boolean)
    .slice(0, 3);
};

const buildLexUzFallbackSource = (queryText) => {
  const query = String(queryText || '').trim();
  if (!query) return [];

  const q = encodeURIComponent(query.slice(0, 120));
  return [
    {
      id: `lexuz_${Date.now()}`,
      title: 'Lex.uz qidiruv',
      url: `https://lex.uz/search/all?query=${q}`,
    },
  ];
};

const normalizeConfidence = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  if (numeric <= 1) return Math.round(numeric * 100);
  if (numeric <= 100) return Math.round(numeric);
  return null;
};

const confidenceTone = (value) => {
  if (value === null) return 'unknown';
  if (value >= 80) return 'high';
  if (value >= 55) return 'medium';
  return 'low';
};

const LOCAL_APPLICATIONS_KEY = 'legallink_user_applications_v1';
const PRO_DEFAULT_PRICE_UZS = 149000;

const SPECIALIZATION_LABELS = {
  inheritance: 'Meros huquqi',
  criminal: 'Jinoyat ishlari',
  civil: 'Fuqarolik ishlari',
  business: 'Biznes huquqi',
  labor: 'Mehnat huquqi',
  international: 'Xalqaro huquq',
  family: 'Oilaviy huquq',
};

const TOPIC_TO_SPECIALIZATIONS = {
  document: ['civil', 'business'],
  consult: ['civil', 'family', 'labor'],
  dispute: ['criminal', 'civil'],
};

const pickLawyerByTopic = (topic) => {
  const key = String(topic || 'consult').toLowerCase();
  const priorities = TOPIC_TO_SPECIALIZATIONS[key] || TOPIC_TO_SPECIALIZATIONS.consult;

  const preferred = lawyers
    .filter((lawyer) => priorities.includes(String(lawyer.specialization || '').toLowerCase()))
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));

  return preferred[0] || lawyers[0] || null;
};

const readApplications = () => {
  try {
    const raw = localStorage.getItem(LOCAL_APPLICATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveApplications = (items) => {
  localStorage.setItem(LOCAL_APPLICATIONS_KEY, JSON.stringify(items));
};

export default function ChatInterface({
  title,
  subtitle,
  type = 'ai',
  initialMessage,
  initialUserPrompt = '',
  quickCheckTitle = '',
  quickCheckPayload = null,
}) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { authToken, user, ensureSupportConversation, sendSupportMessage, safeError } = useAuth();

  const [messages, setMessages] = useState([
    { id: 1, text: initialMessage, sender: 'bot', timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [handoffLoading, setHandoffLoading] = useState(false);
  const [handoffError, setHandoffError] = useState('');
  const [lastAssistantMeta, setLastAssistantMeta] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [freeDocumentRemaining, setFreeDocumentRemaining] = useState(true);
  const messagesContainerRef = useRef(null);
  const [stickToBottom, setStickToBottom] = useState(true);

  const quickTopic = useMemo(() => {
    if (quickCheckPayload?.topic) return String(quickCheckPayload.topic);
    if (type === 'document') return 'document';
    return 'consult';
  }, [quickCheckPayload?.topic, type]);

  const recommendedLawyer = useMemo(() => pickLawyerByTopic(quickTopic), [quickTopic]);

  const isProMode = useMemo(() => {
    return Boolean(
      quickCheckPayload?.isPro
      || quickCheckPayload?.style === 'expert'
      || quickCheckPayload?.urgency === 'high'
      || quickCheckPayload?.topic === 'dispute'
    );
  }, [quickCheckPayload]);

  const proPriceUzs = Number(quickCheckPayload?.proPriceUzs) || PRO_DEFAULT_PRICE_UZS;
  const proPriceLabel = quickCheckPayload?.proPriceLabel || `${proPriceUzs.toLocaleString('ru-RU')} UZS`;

  const allContacts = [
    { id: 'ai', name: t('chat_interface.roles.ai'), status: 'online', type: 'ai' },
    { id: 1, name: 'Azizov Bahrom', status: 'online', type: 'lawyer' },
    { id: 2, name: 'Karimova Nargiza', status: 'offline', type: 'lawyer' },
    { id: 3, name: 'Toshmatov Dilshod', status: 'online', type: 'lawyer' },
  ];

  const contacts = allContacts.filter(contact => {
    if (type === 'ai' || type === 'document') return contact.type === 'ai';
    if (type === 'expert' || type === 'lawyer') return contact.type === 'lawyer';
    return true;
  });

  useEffect(() => {
    if (type !== 'document' || !user) return;
    try {
      const raw = localStorage.getItem(DOCUMENT_FREE_QUOTA_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const key = String(user.email || user.id || 'guest');
      const used = Number(parsed[key] || 0);
      setFreeDocumentRemaining(used < 1);
    } catch {
      setFreeDocumentRemaining(true);
    }
  }, [type, user]);

  const markFreeDocumentUsed = useCallback(() => {
    if (type !== 'document' || !user) return;
    try {
      const raw = localStorage.getItem(DOCUMENT_FREE_QUOTA_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const key = String(user.email || user.id || 'guest');
      const used = Number(parsed[key] || 0);
      parsed[key] = used + 1;
      localStorage.setItem(DOCUMENT_FREE_QUOTA_KEY, JSON.stringify(parsed));
      setFreeDocumentRemaining(parsed[key] < 1);
    } catch {
      // ignore localStorage errors
    }
  }, [type, user]);

  const scrollToBottom = (behavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  };

  useEffect(() => {
    if (stickToBottom) {
      scrollToBottom(messages.length <= 1 ? 'auto' : 'smooth');
    }
  }, [messages, isLoading, stickToBottom]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setStickToBottom(distanceToBottom < 80);
  };

  // Backend ga so'rov yuborish
  const fetchBotResponse = useCallback(async (userText) => {
    const endpoint = CHAT_ENDPOINTS[type] || '/chat/ai';

    const headers = {
      'Content-Type': 'application/json',
    };

    // Agar foydalanuvchi tizimga kirgan bo'lsa, token qo'shamiz
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Conversation tarixi (oxirgi 10 ta xabar)
    const history = messages.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));

    const res = await fetch(buildApiUrl(endpoint), {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: userText,
        history,
        type,
        userId: user?.id || null,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Server xatosi: ${res.status}`);
    }

    const data = await res.json();
    const confidence = normalizeConfidence(data.confidence ?? data.score ?? data.confidenceScore);
    const parsedSources = normalizeSources(data.sources || data.references || data.citations);
    const sources = parsedSources.length ? parsedSources : buildLexUzFallbackSource(userText);
    const escalationReason =
      data.escalationReason ||
      data.reason ||
      data.routingReason ||
      (confidence !== null && confidence < 55 ? 'Javob ishonchliligi past bo‘ldi' : '');
    const canResolveWithLawyer = Boolean(
      data.handoffToAdmin ||
      data.needsHuman ||
      data.needs_human ||
      data.escalate ||
      (confidence !== null && confidence < 55)
    );

    return {
      text: data.reply || data.message || data.response || "Javob olinmadi.",
      handoffToAdmin: canResolveWithLawyer,
      meta: {
        confidence,
        sources,
        escalationReason,
        canResolveWithLawyer,
      },
    };
  }, [authToken, messages, type, user]);

  const handoffToAdmin = useCallback(async ({ firstMessage }) => {
    if (!user) {
      setHandoffError("Mutaxassisga ulash uchun avval tizimga kiring.");
      return;
    }

    setHandoffLoading(true);
    setHandoffError('');

    try {
      const conv = await ensureSupportConversation();
      const text = firstMessage?.trim();

      if (text) {
        await sendSupportMessage({
          conversationId: conv.id,
          text: `AI chatdan o'tkazildi:\n${text}`,
          receiver: 'admin',
        });
      }

      navigate('/chat/support');
    } catch (err) {
      setHandoffError(safeError(err, "Mutaxassisga ulashda xatolik yuz berdi"));
    } finally {
      setHandoffLoading(false);
    }
  }, [ensureSupportConversation, navigate, safeError, sendSupportMessage, user]);

  const sendApplicationToApi = useCallback(async (payload) => {
    const endpoints = ['/applications', '/requests', '/documents', '/api/applications'];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(buildApiUrl(endpoint), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          return await response.json().catch(() => payload);
        }

        if (response.status === 404 || response.status === 405) {
          continue;
        }
      } catch {
        // endpoint bo'yicha xatoni yutamiz, keyingisini sinaymiz
      }
    }

    return null;
  }, [authToken]);

  const createLawyerApplication = useCallback(async (lawyer, noteText) => {
    if (!lawyer || !user) return null;

    const payload = {
      id: `local_ai_app_${Date.now()}`,
      title: 'AI orqali yuborilgan ariza',
      subject: `${quickTopic} bo'yicha murojaat`,
      type: quickTopic,
      description: noteText,
      text: noteText,
      status: 'new',
      createdAt: new Date().toISOString(),
      userEmail: user?.email || '',
      userId: user?.id || null,
      assignedLawyerId: lawyer.id,
      assignedLawyerEmail: lawyer.email || '',
      assignedLawyerName: lawyer.name || '',
      chatApproved: false,
      source: 'ai_triage',
      proMode: isProMode,
      proPriceUzs,
    };

    const remote = await sendApplicationToApi(payload);
    const created = remote?.application || remote?.document || remote?.data || remote || payload;
    const current = readApplications();
    saveApplications([created, ...current]);
    return created;
  }, [isProMode, proPriceUzs, quickTopic, sendApplicationToApi, user]);

  const connectToLawyer = useCallback(async () => {
    if (!recommendedLawyer) return;

    const recentUserContext = messages
      .filter((item) => item.sender === 'user')
      .slice(-3)
      .map((item) => `- ${item.text}`)
      .join('\n');

    const summary = [
      "AI chatdan advokatga yo'naltirilgan ariza",
      quickCheckTitle ? `Yo'nalish: ${quickCheckTitle}` : '',
      `Mavzu: ${quickTopic}`,
      isProMode ? `Tarif: Pro (${proPriceLabel})` : 'Tarif: Standard',
      '',
      'Mijozning so‘nggi xabarlari:',
      recentUserContext || `- ${String(initialUserPrompt || '').trim() || 'Murojaat matni yuborilmagan'}`,
    ].filter(Boolean).join('\n');

    await createLawyerApplication(recommendedLawyer, summary);

    saveQuickLegalCheck({
      ...(quickCheckPayload || {}),
      target: `/chat/lawyer/${recommendedLawyer.id}`,
      recommendationTitle: `${recommendedLawyer.name} bilan chat`,
      prompt: summary,
      topic: quickTopic,
      isPro: isProMode,
      proPriceUzs,
      proPriceLabel,
    });

    navigate(`/chat/lawyer/${recommendedLawyer.id}`);
  }, [
    createLawyerApplication,
    initialUserPrompt,
    isProMode,
    messages,
    navigate,
    proPriceLabel,
    proPriceUzs,
    quickCheckPayload,
    quickCheckTitle,
    quickTopic,
    recommendedLawyer,
  ]);

  const sendMessage = useCallback(async (rawText) => {
    const text = String(rawText || '').trim();
    if (!text) return;
    if (type === 'document' && !freeDocumentRemaining) {
      setHandoffError('Tekin limit tugadi. Davom ettirish uchun mutaxassis bilan bog\'laning yoki obuna faollashtiring.');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 3,
          text: "Tekin hujjat limiti tugadi. Mutaxassis bilan bog'lanib davom ettirishingiz mumkin.",
          sender: 'bot',
          timestamp: new Date(),
          isError: true,
        },
      ]);
      return;
    }

    const userMsg = { id: Date.now(), text, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setStickToBottom(true);
    setInputValue('');
    setIsLoading(true);
    setHandoffError('');

    try {
      const result = await fetchBotResponse(text);
      const botMsg = {
        id: Date.now() + 1,
        text: result.text,
        sender: 'bot',
        timestamp: new Date(),
        meta: result.meta,
      };
      setMessages(prev => [...prev, botMsg]);
      setLastAssistantMeta(result.meta);
      if (type === 'document') {
        markFreeDocumentUsed();
      }

      if ((type === 'ai' || type === 'document') && result.handoffToAdmin) {
        await handoffToAdmin({
          firstMessage: `Mijoz savoli: ${text}\n\nAI javobi: ${result.text}${result.meta?.escalationReason ? `\n\nO'tkazish sababi: ${result.meta.escalationReason}` : ''}`,
        });
      }
    } catch (err) {
      console.error('Chat xatosi:', err.message);
      // Xato xabarini chat ichiga qo'shamiz
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 2,
          text: `⚠️ ${err.message}`,
          sender: 'bot',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchBotResponse, freeDocumentRemaining, handoffToAdmin, markFreeDocumentUsed, type]);

  const handleSend = async () => {
    if (isLoading) return;
    await sendMessage(inputValue);
  };

  useEffect(() => {
    if (bootstrapped) return;
    const seed = String(initialUserPrompt || '').trim();
    if (!seed) {
      setBootstrapped(true);
      return;
    }
    if (isLoading) return;

    setBootstrapped(true);
    sendMessage(seed);
  }, [bootstrapped, initialUserPrompt, isLoading, sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 flex h-[700px] md:h-[800px]">
      {/* Sidebar */}
      <div className="hidden md:flex w-80 bg-slate-50 dark:bg-slate-900 border-r border-slate-100 dark:border-slate-700 flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('chat_interface.sidebar_title')}</h3>
          <div className="relative">
            <input
              type="text"
              placeholder={t('chat_interface.search_placeholder')}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                (contact.type === 'ai' && (type === 'ai' || type === 'document'))
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  contact.type === 'ai'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {contact.type === 'ai' ? <Bot size={20} /> : <User size={20} />}
                </div>
                {contact.status === 'online' && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{contact.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {contact.type === 'ai' ? t('chat_interface.roles.ai') : t('chat_interface.roles.lawyer')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-900/50">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
              type === 'ai' || type === 'document'
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
                : 'bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white'
            }`}>
              {type === 'ai' || type === 'document' ? <Bot size={24} /> : <User size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isLoading ? 'Javob yozmoqda...' : subtitle}
                </p>
              </div>
              {quickCheckTitle && (
                <p className="text-[11px] mt-1 text-blue-600 dark:text-blue-300 font-medium">
                  Tez Legal Check: {quickCheckTitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <Button variant="ghost" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
              <Phone size={20} />
            </Button>
            <Button variant="ghost" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
              <Video size={20} />
            </Button>
            <Button variant="ghost" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
              <MoreVertical size={20} />
            </Button>
          </div>
        </div>
        <div className="px-4 md:px-6 pt-2">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
            <Lock size={12} />
            Suhbatlar 100% maxfiy va xavfsizlik standartlari bo'yicha himoyalangan.
          </p>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 relative"
        >
          <AnimatePresence>
            {messages.map((msg) => (
              <MotionDiv
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.sender === 'user'
                      ? 'bg-[var(--color-primary)] text-white'
                      : msg.isError
                        ? 'bg-red-100 dark:bg-red-900/40 text-red-500'
                        : (type === 'ai' || type === 'document')
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {msg.sender === 'user'
                      ? <User size={14} />
                      : msg.isError
                        ? <AlertCircle size={14} />
                        : (type === 'ai' || type === 'document')
                          ? <Bot size={14} />
                          : <User size={14} />}
                  </div>

                  <div className={`rounded-2xl p-4 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[var(--color-primary)] text-white rounded-br-none'
                      : msg.isError
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-bl-none'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'
                  }`}>
                    <p className="leading-relaxed text-[15px] whitespace-pre-wrap">{msg.text}</p>
                    {msg.sender === 'bot' && !msg.isError && msg.meta && (
                      <div className="mt-2.5 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {msg.meta.confidence !== null && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                                confidenceTone(msg.meta.confidence) === 'high'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800'
                                  : confidenceTone(msg.meta.confidence) === 'medium'
                                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800'
                                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800'
                              }`}
                            >
                              Ishonchlilik: {msg.meta.confidence}%
                            </span>
                          )}
                          {msg.meta.canResolveWithLawyer && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                              Murakkab holat
                            </span>
                          )}
                        </div>
                        {msg.meta.sources?.length ? (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="font-semibold">Manbalar: </span>
                            {msg.meta.sources.map((source) => (
                              <span key={source.id} className="inline-flex mr-2 mb-1">
                                {source.url ? (
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline underline-offset-2 hover:text-blue-600 dark:hover:text-blue-300"
                                  >
                                    {source.title}
                                  </a>
                                ) : (
                                  <span>{source.title}</span>
                                )}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {msg.meta.escalationReason ? (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            O‘tkazish sababi: {msg.meta.escalationReason}
                          </p>
                        ) : null}
                      </div>
                    )}
                    <span className={`text-[10px] mt-1.5 block font-medium opacity-70 ${msg.sender === 'user' ? 'text-blue-100 text-right' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </AnimatePresence>

          {/* Typing / Loading indicator */}
          {isLoading && (
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-end gap-2">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  type === 'ai' || type === 'document'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  <Bot size={14} />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </MotionDiv>
          )}

          {!stickToBottom && (
            <button
              type="button"
              onClick={() => {
                setStickToBottom(true);
                scrollToBottom();
              }}
              className="sticky bottom-2 ml-auto mr-1 inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-md hover:shadow-lg"
            >
              Yangi xabar
            </button>
          )}

        </div>

        {/* Input */}
        <div className="p-4 md:p-6 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 flex items-end gap-2 shadow-inner">
            <Button variant="ghost" className="text-slate-400 hover:text-[var(--color-primary)] p-3 rounded-full hover:bg-white dark:hover:bg-slate-800 h-auto">
              <Paperclip size={20} />
            </Button>

            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat_interface.input_placeholder')}
              disabled={isLoading}
              className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-800 dark:text-white placeholder:text-slate-400 resize-none py-3 max-h-32 min-h-[48px] disabled:opacity-50"
              rows="1"
            />

            <div className="flex items-center gap-1">
              <Button variant="ghost" className="text-slate-400 hover:text-[var(--color-primary)] p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 h-auto hidden sm:flex">
                <Smile size={20} />
              </Button>
              <Button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className={`p-3 rounded-full transition-all duration-300 h-auto ${
                  inputValue.trim() && !isLoading
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                }`}
              >
                {isLoading
                  ? <Loader2 size={20} className="animate-spin" />
                  : <Send size={20} className={inputValue.trim() ? 'translate-x-0.5' : ''} />
                }
              </Button>
            </div>
          </div>
          {(type === 'ai' || type === 'document') && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {type === 'document' && (
                <span className={`text-xs px-2.5 py-1 rounded-lg border ${
                  freeDocumentRemaining
                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-900/20'
                    : 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-900/20'
                }`}>
                  {freeDocumentRemaining ? '1 ta hujjat tekin: faol' : 'Tekin hujjat limiti ishlatilgan'}
                </span>
              )}
              {typeof lastAssistantMeta?.confidence === 'number' && lastAssistantMeta.confidence < 55 && (
                <span className="text-xs px-2.5 py-1 rounded-lg border border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-900/20">
                  Ishonch past, advokatga ulash tavsiya etiladi
                </span>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={handoffLoading || isLoading}
                onClick={() => handoffToAdmin({
                  firstMessage: messages.length
                    ? `Oxirgi murojaat: ${messages[messages.length - 1].text}`
                    : '',
                })}
                className="text-xs py-2 h-auto"
              >
                {handoffLoading ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                Mutaxassisga ulash
              </Button>
            </div>
          )}
          {(type === 'ai' || type === 'document') && recommendedLawyer && (
            <div className="mt-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-900/20 p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {quickTopic === 'document' ? 'Hujjat yo‘nalishi bo‘yicha advokat' : 'Mos advokat tavsiyasi'}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {recommendedLawyer.name} · {SPECIALIZATION_LABELS[recommendedLawyer.specialization] || recommendedLawyer.specialization}
                  </p>
                  {isProMode && (
                    <p className="text-xs mt-1 font-semibold text-rose-700 dark:text-rose-300">
                      Pro narx: {proPriceLabel}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={isProMode ? 'outline' : 'primary'}
                    onClick={() => {
                      void connectToLawyer();
                    }}
                    className="text-xs py-2 h-auto"
                  >
                    {isProMode ? 'Pro: advokat chatiga o‘tish' : 'Advokat chatiga o‘tish'}
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Bu tugma bosilganda ariza tanlangan advokat kabinetiga yuboriladi.
              </p>
            </div>
          )}
          {handoffError && (
            <div className="mt-2">
              <span className="text-xs text-red-500 dark:text-red-400 inline-flex items-center gap-1">
                <AlertCircle size={13} />
                {handoffError}
              </span>
            </div>
          )}
          <div className="text-center mt-2">
            <p className="text-xs text-slate-400">{t('chat_interface.ai_warning')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
