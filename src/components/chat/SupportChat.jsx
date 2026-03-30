import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, FileText, Loader2, Lock, MessageCircleMore, Paperclip, RefreshCw, Send, ShieldCheck, Star, UserRound, X } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { lawyers } from '../../data/lawyers';
import { io } from 'socket.io-client';
import { SOCKET_BASE_URL, SOCKET_PATH } from '../../config/appConfig';

const formatTime = (value) => {
  if (!value) return '--:--';
  const date = new Date(value);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDateTime = (value) => {
  if (!value) return 'Yangi';
  const date = new Date(value);
  return date.toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const normalizeParty = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return 'admin';
  const lower = raw.toLowerCase();
  if (lower === 'admin' || lower === 'system' || lower.startsWith('admin@') || lower.includes('admin')) {
    return 'admin';
  }
  return raw;
};

const parsePairId = (value) => {
  const text = String(value || '');
  if (!text.startsWith('pair|')) return null;
  const parts = text.split('|');
  if (parts.length !== 3) return null;
  return { a: parts[1], b: parts[2] };
};

const ATTACHMENT_MARKER = '\n[[LEGALLINK_ATTACHMENTS]]';
const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
const MAX_ATTACHMENT_COUNT = 3;

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Faylni o‘qib bo‘lmadi'));
    reader.readAsDataURL(file);
  });

const encodeMessageWithAttachments = (text, attachments = []) => {
  if (!attachments.length) return text;
  const payload = attachments.map((item) => ({
    name: item.name,
    type: item.type,
    size: item.size,
    dataUrl: item.dataUrl,
  }));
  return `${text || ''}${ATTACHMENT_MARKER}${JSON.stringify(payload)}`;
};

const decodeMessageContent = (rawText) => {
  const text = String(rawText || '');
  const idx = text.indexOf(ATTACHMENT_MARKER);
  if (idx < 0) return { text, attachments: [] };

  const plain = text.slice(0, idx).trim();
  const json = text.slice(idx + ATTACHMENT_MARKER.length).trim();

  try {
    const parsed = JSON.parse(json);
    const attachments = Array.isArray(parsed) ? parsed : [];
    return { text: plain, attachments };
  } catch {
    return { text, attachments: [] };
  }
};

export default function SupportChat({ lawyerId = null, embedded = false, bootstrapMessage = '' }) {
  const {
    user,
    authToken,
    apiBase,
    isAdmin,
    supportStatusEnabled,
    listSupportConversations,
    ensureSupportConversation,
    getSupportMessages,
    sendSupportMessage,
    setSupportConversationStatus,
    safeError,
  } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [pendingFiles, setPendingFiles] = useState([]);

  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [bootstrapSent, setBootstrapSent] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stickToBottom, setStickToBottom] = useState(true);
  const isLawyer = user?.role === 'lawyer';

  const targetLawyer = useMemo(() => {
    if (!lawyerId) return null;
    const numericId = Number(lawyerId);
    return lawyers.find((l) => String(l.id) === String(numericId)) || null;
  }, [lawyerId]);

  const activeConversation = useMemo(
    () => conversations.find((conv) => String(conv.id) === String(activeConversationId)) || null,
    [conversations, activeConversationId]
  );

  const currentIdentity = useMemo(() => {
    if (!user) return '';
    return isAdmin ? 'admin' : normalizeParty(user.email || user.id);
  }, [isAdmin, user]);

  const activePair = useMemo(() => {
    if (!activeConversation) return null;
    const pair = parsePairId(activeConversation.id);
    if (pair) return pair;

    const peer = normalizeParty(activeConversation.peerId || activeConversation.clientEmail || activeConversation.lawyerId || 'admin');
    return { a: currentIdentity, b: peer };
  }, [activeConversation, currentIdentity]);

  const loadMessages = useCallback(
    async (conversationId, { silent = false } = {}) => {
      if (!conversationId) {
        setMessages([]);
        return;
      }

      if (!silent) setLoadingMessages(true);

      try {
        const list = await getSupportMessages(conversationId);
        setMessages(list);
      } catch (err) {
        setError(safeError(err, 'Xabarlarni olishda xatolik yuz berdi'));
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [getSupportMessages, safeError]
  );

  const loadConversations = useCallback(
    async ({ silent = false } = {}) => {
      if (!user) return;
      if (!silent) setLoadingConversations(true);

      try {
        let list = await listSupportConversations();

        const lawyerConversationMissing =
          lawyerId && !list.some((conv) => String(conv.peerId || conv.lawyerId || '') === String(lawyerId));

        if (!isAdmin && !isLawyer && (!list.length || lawyerConversationMissing)) {
          const created = await ensureSupportConversation({ lawyerId });
          list = [created, ...list.filter((conv) => String(conv.id) !== String(created.id))];
        }

        setConversations(list);

        if (!activeConversationId || !list.some((conv) => String(conv.id) === String(activeConversationId))) {
          setActiveConversationId(list[0]?.id || null);
        }
      } catch (err) {
        setError(safeError(err, "Suhbatlar ro'yxatini yuklab bo'lmadi"));
      } finally {
        if (!silent) setLoadingConversations(false);
      }
    },
    [
      activeConversationId,
      ensureSupportConversation,
      isAdmin,
      isLawyer,
      lawyerId,
      listSupportConversations,
      safeError,
      user,
    ]
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    loadMessages(activeConversationId);
  }, [activeConversationId, loadMessages]);

  useEffect(() => {
    const text = String(bootstrapMessage || '').trim();
    if (!text) return;
    if (!activeConversationId || bootstrapSent || sending) return;

    const run = async () => {
      try {
        setBootstrapSent(true);
        await sendSupportMessage({ conversationId: activeConversationId, text, receiver: 'admin' });
        await Promise.all([
          loadMessages(activeConversationId, { silent: true }),
          loadConversations({ silent: true }),
        ]);
      } catch (err) {
        setError(safeError(err, 'Boshlang\'ich xabar yuborilmadi'));
      }
    };

    run();
  }, [activeConversationId, bootstrapMessage, bootstrapSent, loadConversations, loadMessages, safeError, sendSupportMessage, sending]);

  useEffect(() => {
    if (!activeConversationId || isAdmin) {
      setFeedbackRating(0);
      setFeedbackComment('');
      setFeedbackSent(false);
      return;
    }

    const storageKey = `support_feedback_${activeConversationId}`;
    const cached = localStorage.getItem(storageKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setFeedbackRating(Number(parsed.rating) || 0);
        setFeedbackComment(String(parsed.comment || ''));
        setFeedbackSent(Boolean(parsed.sent));
        return;
      } catch {
        // cache buzilgan bo'lsa reset qilamiz
      }
    }

    setFeedbackRating(0);
    setFeedbackComment('');
    setFeedbackSent(false);
  }, [activeConversationId, isAdmin]);

  const chatBlockedByApproval = useMemo(() => {
    if (!activeConversation || isAdmin) return false;
    return activeConversation.requiresApproval && !activeConversation.chatApproved;
  }, [activeConversation, isAdmin]);

  const canSendInActiveConversation = Boolean(
    activeConversation
    && !(supportStatusEnabled && activeConversation?.status === 'closed')
    && !chatBlockedByApproval
  );

  useEffect(() => {
    if (!stickToBottom) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: messages.length <= 1 ? 'auto' : 'smooth' });
  }, [messages, loadingMessages, stickToBottom]);

  useEffect(() => {
    if (!user) return undefined;

    const socketUrl = SOCKET_BASE_URL || apiBase || window.location.origin;

    const socket = io(socketUrl, {
      transports: ['websocket'],
      withCredentials: true,
      path: SOCKET_PATH,
      reconnection: true,
      reconnectionAttempts: Infinity,
      ...(authToken ? { auth: { token: authToken } } : {}),
    });

    socketRef.current = socket;

    socket.on('receive_message', () => {
      loadConversations({ silent: true });
      if (activeConversationId) {
        loadMessages(activeConversationId, { silent: true });
      }
    });

    socket.on('connect_error', () => {
      // Socket ishlamasa polling davom etadi.
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeConversationId, apiBase, authToken, loadConversations, loadMessages, user]);

  useEffect(() => {
    if (!socketRef.current || !activePair) return;

    socketRef.current.emit('join_chat', {
      userId: activePair.a,
      lawyerId: activePair.b,
    });
  }, [activePair]);

  useEffect(() => {
    if (!user) return undefined;

    const interval = setInterval(() => {
      loadConversations({ silent: true });
      if (activeConversationId) {
        loadMessages(activeConversationId, { silent: true });
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [activeConversationId, loadConversations, loadMessages, user]);

  const handleSend = async () => {
    if (!activeConversationId || sending) return;
    if (chatBlockedByApproval) {
      setError('Chat hali admin tomonidan tasdiqlanmagan');
      return;
    }
    const text = inputValue.trim();
    if (!text && !pendingFiles.length) return;

    setSending(true);
    setStickToBottom(true);
    setError(null);

    try {
      const socket = socketRef.current;
      const peer = normalizeParty(activeConversation?.peerId || activePair?.b || 'admin');
      const messagePayload = encodeMessageWithAttachments(text, pendingFiles);
      const hasAttachments = pendingFiles.length > 0;

      if (socket?.connected && currentIdentity && !hasAttachments) {
        socket.emit('send_message', {
          userId: currentIdentity,
          lawyerId: peer,
          message: messagePayload,
          sender: currentIdentity,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: `temp_${Date.now()}`,
            conversationId: activeConversationId,
            senderId: currentIdentity,
            senderRole: isAdmin ? 'admin' : 'user',
            senderName: user?.name || user?.email || currentIdentity,
            text: messagePayload,
            createdAt: new Date().toISOString(),
          },
        ]);
      } else {
        await sendSupportMessage({ conversationId: activeConversationId, text: messagePayload, receiver: peer });
      }

      setInputValue('');
      setPendingFiles([]);
      await Promise.all([
        loadMessages(activeConversationId, { silent: true }),
        loadConversations({ silent: true }),
      ]);
    } catch (err) {
      setError(safeError(err, 'Xabar yuborishda xatolik yuz berdi'));
    } finally {
      setSending(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!isAdmin || !activeConversation) return;

    const nextStatus = activeConversation.status === 'closed' ? 'open' : 'closed';

    try {
      await setSupportConversationStatus(activeConversation.id, nextStatus);
      await loadConversations({ silent: true });
    } catch (err) {
      setError(safeError(err, 'Statusni o\'zgartirib bo\'lmadi'));
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handlePickFiles = async (event) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;
    event.target.value = '';

    if (pendingFiles.length + selected.length > MAX_ATTACHMENT_COUNT) {
      setError(`Bir xabarga maksimal ${MAX_ATTACHMENT_COUNT} ta fayl yuborish mumkin.`);
      return;
    }

    const oversize = selected.find((file) => file.size > MAX_ATTACHMENT_SIZE);
    if (oversize) {
      setError(`${oversize.name} hajmi 5 MB dan katta. Kichikroq fayl yuboring.`);
      return;
    }

    setProcessingFiles(true);
    setError(null);

    try {
      const prepared = await Promise.all(selected.map(async (file) => ({
        id: `file_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        dataUrl: await fileToDataUrl(file),
      })));
      setPendingFiles((prev) => [...prev, ...prepared].slice(0, MAX_ATTACHMENT_COUNT));
    } catch (err) {
      setError(safeError(err, 'Faylni yuklashda xatolik'));
    } finally {
      setProcessingFiles(false);
    }
  };

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    setStickToBottom(distanceToBottom < 80);
  };

  const handleSendFeedback = async () => {
    if (!activeConversationId || !feedbackRating || feedbackSending || feedbackSent) return;

    setFeedbackSending(true);

    try {
      const note = feedbackComment.trim();
      const text = `[Feedback] Baho: ${feedbackRating}/5${note ? `\nIzoh: ${note}` : ''}`;
      await sendSupportMessage({ conversationId: activeConversationId, text, receiver: 'admin' });

      const payload = { rating: feedbackRating, comment: note, sent: true };
      localStorage.setItem(`support_feedback_${activeConversationId}`, JSON.stringify(payload));
      setFeedbackSent(true);
    } catch (err) {
      setError(safeError(err, 'Feedback yuborib bo\'lmadi'));
    } finally {
      setFeedbackSending(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 text-center">
        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-3">
          Chatdan foydalanish uchun tizimga kiring
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Mutaxassis bilan yozishma faqat ro\'yxatdan o\'tgan foydalanuvchilar uchun ochiq.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 inline-flex items-center gap-1.5">
          <Lock size={13} />
          Suhbatlar 100% maxfiy va xavfsizlik standartlari asosida himoyalangan.
        </p>
        <Link to="/auth">
          <Button className="btn-primary">Kirish / Ro\'yxatdan o\'tish</Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row ${
        embedded ? 'h-[760px]' : 'h-[72vh] min-h-[600px]'
      }`}
    >
      <aside className="md:w-[340px] border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Suhbatlar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Jami: {conversations.length}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => loadConversations()}
            disabled={loadingConversations}
            className="p-2 rounded-lg h-auto"
          >
            {loadingConversations ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-2">
          {loadingConversations && !conversations.length ? (
            <div className="p-4 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Yuklanmoqda...
            </div>
          ) : conversations.length ? (
            conversations.map((conv) => {
              const isActive = String(conv.id) === String(activeConversationId);
              const title = isAdmin
                ? conv.clientName || conv.clientEmail || 'Mijoz'
                : isLawyer
                  ? conv.clientName || conv.clientEmail || 'Mijoz'
                  : 'Platforma mutaxassisi';
              const subtitle = isAdmin && conv.clientEmail
                ? conv.clientEmail
                : isLawyer
                  ? (conv.subject || "Mijoz murojaati")
                  : targetLawyer?.name
                    ? `${targetLawyer.name} bo'yicha`
                    : conv.subject;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-colors ${
                    isActive
                      ? 'border-blue-300 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-200 truncate">{title}</p>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        conv.status === 'closed'
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {conv.status === 'closed' ? 'Yopilgan' : 'Ochiq'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
                  <p className="text-xs text-slate-400 mt-2 truncate">{conv.lastMessage || 'Xabar yo\'q'}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{formatDateTime(conv.updatedAt)}</p>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-sm text-slate-500 dark:text-slate-400">Suhbatlar hali mavjud emas.</div>
          )}
        </div>
      </aside>

      <section className="flex-1 flex flex-col min-h-0">
        <header className="p-4 md:p-5 border-b border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isAdmin ? 'Chat markazi' : isLawyer ? 'Advokat kabineti: mijoz chatlari' : 'Mutaxassis bilan to‘g‘ridan-to‘g‘ri chat'}
            </p>
            <h2 className="font-bold text-slate-900 dark:text-white truncate">
              {activeConversation
                ? isAdmin
                  ? activeConversation.clientName || activeConversation.clientEmail || 'Mijoz'
                  : isLawyer
                    ? activeConversation.clientName || activeConversation.clientEmail || 'Mijoz'
                  : targetLawyer?.name
                    ? `${targetLawyer.name} bo'yicha yordam`
                    : 'Platforma mutaxassisi'
                : 'Suhbat tanlanmagan'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {activeConversation && (
              <span
                className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                  activeConversation.status === 'closed'
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                }`}
              >
                {activeConversation.status === 'closed' ? 'Yopilgan' : 'Jarayonda'}
              </span>
            )}

            {isAdmin && supportStatusEnabled && activeConversation && (
              <Button
                type="button"
                variant="outline"
                onClick={handleStatusToggle}
                className="text-xs py-2 px-3 h-auto"
              >
                <ShieldCheck size={14} className="mr-1" />
                {activeConversation.status === 'closed' ? 'Qayta ochish' : 'Yopish'}
              </Button>
            )}
          </div>
        </header>
        <div className="px-4 pt-2">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
            <Lock size={12} />
            Suhbatlar 100% sir saqlanadi va xavfsizlik talablari asosida himoyalanadi.
          </p>
        </div>

        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/30 space-y-4 relative"
        >
          {loadingMessages ? (
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Xabarlar yuklanmoqda...
            </div>
          ) : messages.length ? (
            messages.map((msg) => {
              const mine = normalizeParty(msg.senderId) === currentIdentity;
              const parsed = decodeMessageContent(msg.text);

              return (
                <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] md:max-w-[70%] flex items-end gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        mine
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {mine ? <ShieldCheck size={14} /> : <UserRound size={14} />}
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-3 shadow-sm border ${
                        mine
                          ? 'bg-blue-600 text-white border-blue-500 rounded-br-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 rounded-bl-sm'
                      }`}
                    >
                      {parsed.text ? (
                        <p className="text-[15px] whitespace-pre-wrap">{parsed.text}</p>
                      ) : (
                        <p className="text-[15px] opacity-80">Fayl yuborildi</p>
                      )}
                      {parsed.attachments.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {parsed.attachments.map((file, index) => (
                            <a
                              key={`${msg.id}_att_${index}`}
                              href={file.dataUrl || '#'}
                              download={file.name || `file_${index + 1}`}
                              className={`flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-xs ${
                                mine
                                  ? 'border-blue-400/40 bg-blue-500/20 text-blue-50'
                                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <span className="inline-flex items-center gap-1.5 min-w-0">
                                <FileText size={13} />
                                <span className="truncate">{file.name || 'Fayl'}</span>
                              </span>
                              <span className="shrink-0">{formatFileSize(Number(file.size || 0))}</span>
                            </a>
                          ))}
                        </div>
                      )}
                      <p className={`text-[11px] mt-2 ${mine ? 'text-blue-100 text-right' : 'text-slate-400'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center text-slate-500 dark:text-slate-400 gap-2">
              <MessageCircleMore size={40} className="opacity-40" />
              <p>Bu suhbatda hali xabarlar yo‘q.</p>
            </div>
          )}

          {!stickToBottom && (
            <button
              type="button"
              onClick={() => {
                setStickToBottom(true);
                const container = messagesContainerRef.current;
                if (!container) return;
                container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
              }}
              className="sticky bottom-2 ml-auto mr-1 inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-md hover:shadow-lg"
            >
              Yangi xabar
            </button>
          )}
        </div>

        {error && (
          <div className="px-4 pb-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {!isAdmin && !isLawyer && activeConversation && (
          <div className="px-4 pb-2">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50 p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Suhbat sifati</p>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setFeedbackRating(rate)}
                    disabled={feedbackSent}
                    className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-lg border ${
                      feedbackRating >= rate
                        ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'
                        : 'bg-white border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <Star size={12} className={feedbackRating >= rate ? 'fill-current' : ''} />
                    {rate}
                  </button>
                ))}
                {feedbackSent && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400">Rahmat, feedback yuborildi.</span>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={feedbackComment}
                  onChange={(event) => setFeedbackComment(event.target.value)}
                  disabled={feedbackSent}
                  placeholder="Qisqa izoh (ixtiyoriy)"
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
                <Button
                  type="button"
                  onClick={handleSendFeedback}
                  disabled={!feedbackRating || feedbackSending || feedbackSent}
                  className="h-auto py-2 px-3 text-xs"
                >
                  {feedbackSending ? <Loader2 size={13} className="animate-spin" /> : 'Yuborish'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handlePickFiles}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
          />
          {pendingFiles.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {pendingFiles.map((file) => (
                <span
                  key={file.id}
                  className="inline-flex items-center gap-1.5 text-xs rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2.5 py-1"
                >
                  <FileText size={12} />
                  {file.name}
                  <button
                    type="button"
                    onClick={() => setPendingFiles((prev) => prev.filter((item) => item.id !== file.id))}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canSendInActiveConversation || sending || processingFiles}
              className="h-[46px] px-3"
            >
              {processingFiles ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
            </Button>
            <textarea
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Xabaringizni yozing..."
              disabled={!canSendInActiveConversation || sending}
              className="flex-1 resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/70 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60"
            />
            <Button
              type="button"
              onClick={handleSend}
              disabled={(!inputValue.trim() && pendingFiles.length === 0) || sending || !canSendInActiveConversation || processingFiles}
              className="btn-primary h-[46px] px-4"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </Button>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Fayl turlari: PDF, DOC, DOCX, TXT, JPG, PNG (max 5 MB, 3 ta fayl).
          </p>
          {chatBlockedByApproval && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 inline-flex items-center gap-1.5">
              <AlertTriangle size={13} />
              Admin chatga ruxsat berishini kuting. Ruxsat berilgach yozishma ochiladi.
            </p>
          )}
          {supportStatusEnabled && activeConversation?.status === 'closed' && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
              Suhbat yopilgan. Yangi yozishma uchun mutaxassis bu suhbatni qayta ochishi kerak.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
