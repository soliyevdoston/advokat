/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL, ENABLE_LOCAL_FALLBACK, buildApiUrl } from '../config/appConfig';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = 'advokat_auth_token';
const USER_KEY = 'advokat_user';
const LOCAL_USERS_KEY = 'advokat_local_users_v1';
const SUPPORT_CONVERSATIONS_KEY = 'advokat_support_conversations_v1';
const SUPPORT_MESSAGES_KEY = 'advokat_support_messages_v1';
const SUPPORT_APPROVALS_KEY = 'advokat_support_approvals_v1';
const LOCAL_APPLICATIONS_KEY = 'legallink_user_applications_v1';

const readJSON = (key, fallback = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const normalizeUser = (rawUser = {}) => {
  const email = rawUser.email || rawUser.username || '';
  const nameFromEmail = email.includes('@') ? email.split('@')[0] : 'Foydalanuvchi';

  return {
    ...rawUser,
    id: rawUser.id || rawUser.userId || rawUser._id || email || `user_${Date.now()}`,
    email,
    name: rawUser.name || rawUser.fullName || rawUser.username || nameFromEmail,
    role: rawUser.role || (rawUser.isAdmin ? 'admin' : 'user'),
    created_at: rawUser.created_at || rawUser.createdAt || new Date().toISOString(),
  };
};

const getToken = () => localStorage.getItem(TOKEN_KEY) || null;
const getUser = () => {
  const raw = readJSON(USER_KEY, null);
  return raw ? normalizeUser(raw) : null;
};

const saveSession = (token, user) => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(normalizeUser(user)));
};

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const safeError = (err, fallback) => err?.message || fallback;
const USE_LOCAL_FALLBACK = ENABLE_LOCAL_FALLBACK;

async function apiRequest(path, { method = 'GET', body, token, headers = {} } = {}) {
  const response = await fetch(buildApiUrl(path), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || `Server xatosi: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function apiRequestAny(paths, options) {
  let lastError = null;

  for (const path of paths) {
    try {
      return await apiRequest(path, options);
    } catch (err) {
      lastError = err;
      if (err?.status === 404 || err?.status === 405) continue;
      throw err;
    }
  }

  throw lastError || new Error('Endpoint topilmadi');
}

const loadLocalUsers = () => readJSON(LOCAL_USERS_KEY, []);
const saveLocalUsers = (users) => writeJSON(LOCAL_USERS_KEY, users);

const loadConversations = () => readJSON(SUPPORT_CONVERSATIONS_KEY, []);
const saveConversations = (conversations) => writeJSON(SUPPORT_CONVERSATIONS_KEY, conversations);

const loadMessages = () => readJSON(SUPPORT_MESSAGES_KEY, []);
const saveMessages = (messages) => writeJSON(SUPPORT_MESSAGES_KEY, messages);
const loadSupportApprovals = () => readJSON(SUPPORT_APPROVALS_KEY, {});
const saveSupportApprovals = (approvals) => writeJSON(SUPPORT_APPROVALS_KEY, approvals);

const toSorted = (items, key = 'updatedAt') => {
  return [...items].sort((a, b) => new Date(b[key] || 0).getTime() - new Date(a[key] || 0).getTime());
};

const normalizeConversation = (conv = {}) => ({
  id: conv.id || conv._id || `conv_${Date.now()}`,
  clientId: conv.clientId || conv.userId || conv.customerId || conv.client?.id,
  clientEmail: conv.clientEmail || conv.client?.email || '',
  clientName: conv.clientName || conv.client?.name || conv.client?.fullName || 'Mijoz',
  adminId: conv.adminId || conv.operatorId || null,
  subject: conv.subject || "Yuridik masala bo'yicha murojaat",
  status: conv.status || 'open',
  lawyerId: conv.lawyerId || conv.meta?.lawyerId || null,
  unreadForAdmin: conv.unreadForAdmin || 0,
  unreadForClient: conv.unreadForClient || 0,
  createdAt: conv.createdAt || conv.created_at || new Date().toISOString(),
  updatedAt: conv.updatedAt || conv.updated_at || new Date().toISOString(),
  lastMessage: conv.lastMessage || conv.preview || '',
  participantA: conv.participantA || null,
  participantB: conv.participantB || null,
  peerId: conv.peerId || null,
  requiresApproval: typeof conv.requiresApproval === 'boolean'
    ? conv.requiresApproval
    : Boolean(conv.lawyerId || conv.peerId?.toString?.().startsWith('lawyer_')),
  chatApproved: typeof conv.chatApproved === 'boolean'
    ? conv.chatApproved
    : !Boolean(conv.lawyerId || conv.peerId?.toString?.().startsWith('lawyer_')),
  approvedBy: conv.approvedBy || null,
  approvalUpdatedAt: conv.approvalUpdatedAt || conv.approvedAt || null,
});

const normalizeMessage = (msg = {}) => ({
  id: msg.id || msg._id || `msg_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
  conversationId: msg.conversationId || msg.chatId || msg.roomId,
  senderId: msg.senderId || msg.userId || msg.sender?.id,
  senderRole: msg.senderRole || msg.sender?.role || 'user',
  senderName: msg.senderName || msg.sender?.name || msg.sender?.email || 'Foydalanuvchi',
  text: msg.text || msg.message || msg.content || '',
  createdAt: msg.createdAt || msg.created_at || new Date().toISOString(),
});

const CHAT_ENDPOINT = '/chats';
const LOGIN_ENDPOINTS = ['/auth/login', '/login', '/users/login'];
const SEND_CODE_ENDPOINTS = ['/auth/send-code', '/send-code', '/users/send-code'];
const VERIFY_CODE_ENDPOINTS = ['/auth/verify-code', '/verify-code', '/users/verify-code'];
const REGISTER_ENDPOINTS = ['/auth/register', '/users/register'];
const CREATE_ADMIN_ENDPOINTS = ['/users/create_admin', '/users/create-admin', '/create_admin'];
const CREATE_LAWYER_ENDPOINTS = ['/users/create_lawyer', '/users/create-lawyer', '/create_lawyer'];
const USERS_ENDPOINTS = ['/users/', '/users', '/auth/users'];

const normalizeParty = (value) => {
  const raw = String(value ?? '').trim();
  if (!raw) return 'admin';
  const lower = raw.toLowerCase();

  if (lower === 'admin' || lower === 'system' || lower.startsWith('admin@') || lower.includes('admin')) {
    return 'admin';
  }

  return raw;
};

const getCurrentIdentity = (currentUser) => {
  if (!currentUser) return '';
  if (currentUser.role === 'admin') return 'admin';
  return normalizeParty(currentUser.email || currentUser.id);
};

const makeConversationId = (a, b) => {
  const [left, right] = [normalizeParty(a), normalizeParty(b)].sort();
  return `pair|${left}|${right}`;
};

const parseConversationId = (value) => {
  if (!String(value || '').startsWith('pair|')) return null;
  const parts = String(value).split('|');
  if (parts.length !== 3) return null;
  return { a: parts[1], b: parts[2] };
};

const normalizeApprovalMap = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value;
};

const applySupportApproval = (conversation) => {
  const normalized = normalizeConversation(conversation);
  if (!normalized.requiresApproval) {
    return { ...normalized, chatApproved: true };
  }

  const approvalMap = normalizeApprovalMap(loadSupportApprovals());
  const approval = approvalMap[String(normalized.id)];
  if (!approval) return normalized;

  return {
    ...normalized,
    chatApproved: Boolean(approval.approved),
    approvedBy: approval.approvedBy || normalized.approvedBy || null,
    approvalUpdatedAt: approval.updatedAt || normalized.approvalUpdatedAt || null,
  };
};

const conversationMatchesLawyer = (conversation, currentUser) => {
  if (!conversation || !currentUser) return false;
  const keys = [
    String(currentUser.lawyerId || '').trim(),
    String(currentUser.email || '').trim(),
    String(currentUser.id || '').trim(),
  ].filter(Boolean);
  if (!keys.length) return false;

  const pair = parseConversationId(conversation.id);
  const pairValues = pair ? [pair.a, pair.b] : [];

  return keys.some((key) => (
    String(conversation.lawyerId || '') === key
    || String(conversation.peerId || '') === key
    || pairValues.includes(key)
  ));
};

const normalizeChatRow = (row = {}) => {
  const sender = normalizeParty(row.sender || row.senderId || row.senderEmail || row.sender?.email || row.sender?.id);
  const receiver = normalizeParty(row.receiver ?? row.receiverId ?? row.receiverEmail ?? row.receiver?.email ?? row.receiver?.id);

  return {
    id: row.id || row._id || `chat_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    sender,
    receiver,
    message: row.message || row.text || row.content || '',
    type: row.type || 'support',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
};

const mapChatRows = (data) => {
  const rawList = Array.isArray(data) ? data : (data.chats || data.data || data.items || []);
  return Array.isArray(rawList) ? rawList.map(normalizeChatRow) : [];
};

const buildConversationsFromChats = (rows, currentUser) => {
  const currentIdentity = getCurrentIdentity(currentUser);
  const isAdmin = currentUser?.role === 'admin';

  const scopedRows = rows.filter((row) => {
    if (isAdmin) return true;
    return row.sender === currentIdentity || row.receiver === currentIdentity;
  });

  const grouped = new Map();

  scopedRows.forEach((row) => {
    const conversationId = makeConversationId(row.sender, row.receiver);

    if (!grouped.has(conversationId)) {
      grouped.set(conversationId, []);
    }

    grouped.get(conversationId).push(row);
  });

  const conversations = Array.from(grouped.entries()).map(([id, messages]) => {
    const sortedMessages = [...messages].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const first = sortedMessages[0];
    const last = sortedMessages[sortedMessages.length - 1];
    const pair = parseConversationId(id) || { a: first.sender, b: first.receiver };
    const peerId = pair.a === currentIdentity ? pair.b : pair.a;

    const clientEmail = isAdmin
      ? (peerId === 'admin' ? pair.a : peerId)
      : currentUser?.email || '';

    const defaultName = clientEmail.includes('@')
      ? clientEmail.split('@')[0]
      : (peerId === 'admin' ? 'Platforma admini' : `Foydalanuvchi ${peerId}`);

    return normalizeConversation({
      id,
      clientId: clientEmail || peerId,
      clientEmail,
      clientName: isAdmin ? defaultName : (currentUser?.name || defaultName),
      subject: peerId === 'admin' ? 'Platforma mutaxassisi bilan chat' : `ID ${peerId} bo'yicha chat`,
      status: 'open',
      lawyerId: peerId !== 'admin' && !String(peerId).includes('@') ? peerId : null,
      createdAt: first.createdAt,
      updatedAt: last.createdAt,
      lastMessage: last.message,
      participantA: pair.a,
      participantB: pair.b,
      peerId,
    });
  });

  return toSorted(conversations.map(applySupportApproval), 'updatedAt');
};

const seedLocalAdmin = () => {
  const users = loadLocalUsers();
  const hasAdmin = users.some((u) => u.role === 'admin');

  if (!hasAdmin) {
    users.push({
      id: 'local_admin_1',
      name: 'Bosh Admin',
      email: 'admin@legallink.uz',
      password: 'admin12345',
      role: 'admin',
      created_at: new Date().toISOString(),
      source: 'local',
    });
    saveLocalUsers(users);
  }
};

const rememberUserForLocalFeatures = (user, password = null) => {
  if (!user?.email) return;

  const users = loadLocalUsers();
  const idx = users.findIndex((u) => u.email?.toLowerCase() === user.email.toLowerCase());

  if (idx >= 0) {
    users[idx] = {
      ...users[idx],
      ...user,
      password: password || users[idx].password,
    };
  } else {
    users.push({
      ...user,
      password,
      source: 'api',
    });
  }

  saveLocalUsers(users);
};

const localRegister = (email, password) => {
  const users = loadLocalUsers();
  const hasUser = users.some((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (hasUser) {
    throw new Error("Bu email allaqachon ro'yxatdan o'tgan");
  }

  const user = normalizeUser({
    id: `local_user_${Date.now()}`,
    email,
    name: email.split('@')[0],
    role: 'user',
    created_at: new Date().toISOString(),
    source: 'local',
  });

  users.push({ ...user, password });
  saveLocalUsers(users);

  const token = `local_token_${user.id}_${Date.now()}`;
  return { token, user };
};

const localLogin = (email, password) => {
  const users = loadLocalUsers();
  const matched = users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!matched) {
    throw new Error("Email yoki parol noto'g'ri");
  }

  const user = normalizeUser(matched);
  const token = `local_token_${user.id}_${Date.now()}`;
  return { token, user };
};

const ensureLocalConversation = ({ currentUser, lawyerId = null }) => {
  const conversations = loadConversations();

  const existing = conversations.find(
    (conv) => String(conv.clientId) === String(currentUser.id) && String(conv.lawyerId || '') === String(lawyerId || '')
  );

  if (existing) return normalizeConversation(existing);

  const relatedApplications = readJSON(LOCAL_APPLICATIONS_KEY, []);
  const approvedFromApplications = Boolean(lawyerId) && relatedApplications.some((item) => {
    const appLawyerId = String(item?.assignedLawyerId || item?.lawyerId || '').trim();
    const appUserEmail = String(item?.userEmail || item?.clientEmail || '').trim().toLowerCase();
    return (
      appLawyerId === String(lawyerId).trim()
      && appUserEmail === String(currentUser.email || '').trim().toLowerCase()
      && item?.chatApproved === true
    );
  });

  const newConversation = normalizeConversation({
    id: `conv_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
    clientId: currentUser.id,
    clientEmail: currentUser.email,
    clientName: currentUser.name,
    subject: lawyerId ? `Advokat #${lawyerId} bo'yicha murojaat` : 'Platforma mutaxassisi bilan chat',
    status: 'open',
    lawyerId: lawyerId || null,
    requiresApproval: Boolean(lawyerId),
    chatApproved: lawyerId ? approvedFromApplications : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unreadForAdmin: 1,
  });

  conversations.push(newConversation);
  saveConversations(conversations);

  const messages = loadMessages();
  messages.push(
    normalizeMessage({
      id: `msg_${Date.now()}_welcome`,
      conversationId: newConversation.id,
      senderId: 'system',
      senderRole: 'admin',
      senderName: 'Platforma admini',
      text: lawyerId
        ? (approvedFromApplications
            ? 'Murojaatingiz bo‘yicha chat ochildi. Advokat bilan yozishishingiz mumkin.'
            : 'Murojaatingiz qabul qilindi. Admin tasdiqlaganidan keyin advokat bilan chat ochiladi.')
        : 'Assalomu alaykum. Murojaatingiz qabul qilindi. Tez orada sizga yordam beramiz.',
      createdAt: new Date().toISOString(),
    })
  );
  saveMessages(messages);

  return newConversation;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getUser);
  const [authToken, setAuthToken] = useState(getToken);

  useEffect(() => {
    if (USE_LOCAL_FALLBACK) {
      seedLocalAdmin();
    }
  }, []);

  useEffect(() => {
    const sync = () => {
      setAuthToken(getToken());
      setUser(getUser());
    };

    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const setSession = (token, userData, password = null) => {
    const normalized = normalizeUser(userData);
    saveSession(token, normalized);
    setAuthToken(token);
    setUser(normalized);
    if (USE_LOCAL_FALLBACK) {
      rememberUserForLocalFeatures(normalized, password);
    }
    return { token, user: normalized };
  };

  const login = async (email, password) => {
    try {
      const data = await apiRequestAny(LOGIN_ENDPOINTS, {
        method: 'POST',
        body: { email, password },
      });

      const token = data.token || data.accessToken || data.data?.token || data.data?.accessToken;
      const userData = data.user || data.data?.user || data.data || data;

      if (!token) {
        throw new Error('Token server tomonidan qaytarilmadi');
      }

      return setSession(token, userData, password);
    } catch (err) {
      if (!USE_LOCAL_FALLBACK) throw err;
      const shouldUseLocal = !err.status || err.status >= 500 || [400, 401, 404].includes(err.status);
      if (!shouldUseLocal) throw err;

      const local = localLogin(email, password);
      return setSession(local.token, local.user, password);
    }
  };

  const register = async (email, password) => {
    try {
      const data = await apiRequestAny(REGISTER_ENDPOINTS, {
        method: 'POST',
        body: { email, password },
      });

      const token = data.token || data.accessToken;
      const userData = data.user || data.data?.user;

      if (token && userData) {
        const session = setSession(token, userData, password);
        return { ...session, requiresVerification: false };
      }

      if (data.requiresVerification || data.success || data.tempToken) {
        return { requiresVerification: true };
      }

      if (!USE_LOCAL_FALLBACK) {
        throw new Error('Backend register javobi noto‘g‘ri formatda qaytdi');
      }

      const local = localRegister(email, password);
      const session = setSession(local.token, local.user, password);
      return { ...session, requiresVerification: false, localOnly: true };
    } catch (err) {
      // Agar backend email+kod flow ishlatsa
      if (err?.status === 409) throw err;

      if (!USE_LOCAL_FALLBACK) {
        try {
          await sendCode(email, password);
          return { requiresVerification: true };
        } catch {
          throw err;
        }
      }

      try {
        await sendCode(email, password);
        return { requiresVerification: true };
      } catch {
        const local = localRegister(email, password);
        const session = setSession(local.token, local.user, password);
        return { ...session, requiresVerification: false, localOnly: true };
      }
    }
  };

  const sendCode = async (email, password) => {
    const data = await apiRequestAny(SEND_CODE_ENDPOINTS, {
      method: 'POST',
      body: { email, password },
    });

    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      setAuthToken(data.token);
    }

    return data;
  };

  const verifyCode = async (email, code) => {
    const token = getToken();

    if (!token) {
      throw new Error("Token topilmadi. Iltimos, qayta urinib ko'ring");
    }

    const data = await apiRequestAny(VERIFY_CODE_ENDPOINTS, {
      method: 'POST',
      body: {
        email,
        authToken: token,
        token,
        code,
      },
    });

    const finalToken = data.token || data.accessToken || token;
    const userData = data.user || data.data?.user || data;

    return setSession(finalToken, userData);
  };

  const logout = () => {
    clearSession();
    setAuthToken(null);
    setUser(null);
  };

  const setManualToken = (token, userData = null) => {
    localStorage.setItem(TOKEN_KEY, token);
    setAuthToken(token);
    if (userData) {
      const normalized = normalizeUser(userData);
      localStorage.setItem(USER_KEY, JSON.stringify(normalized));
      setUser(normalized);
      if (USE_LOCAL_FALLBACK) {
        rememberUserForLocalFeatures(normalized);
      }
    }
  };

  const createAdmin = async (email, password) => {
    if (user?.role !== 'admin') {
      throw new Error('Faqat admin yangi admin yarata oladi');
    }

    try {
      const data = await apiRequestAny(CREATE_ADMIN_ENDPOINTS, {
        method: 'POST',
        token: authToken,
        body: { email, password },
      });
      return data;
    } catch {
      if (!USE_LOCAL_FALLBACK) {
        throw new Error('Admin yaratish API orqali bajarilmadi');
      }

      let fallback;
      try {
        fallback = localRegister(email, password);
      } catch (localErr) {
        if (!String(localErr?.message || '').includes("allaqachon ro'yxatdan o'tgan")) {
          throw localErr;
        }

        const users = loadLocalUsers();
        const existing = users.find((item) => item.email?.toLowerCase() === email.toLowerCase());
        if (!existing) throw localErr;

        existing.role = 'admin';
        saveLocalUsers(users);
        return { success: true, user: normalizeUser(existing), fallback: true };
      }

      const users = loadLocalUsers();
      const idx = users.findIndex((u) => String(u.id) === String(fallback.user.id));

      if (idx >= 0) {
        users[idx] = { ...users[idx], role: 'admin' };
      }

      saveLocalUsers(users);
      return { success: true, user: { ...fallback.user, role: 'admin' }, fallback: true };
    }
  };

  const createLawyerAccount = async ({ email, password, name = '', lawyerId = null } = {}) => {
    if (user?.role !== 'admin') {
      throw new Error('Faqat admin advokat akkaunti yarata oladi');
    }

    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '').trim();
    if (!normalizedEmail) throw new Error('Advokat emailini kiriting');
    if (normalizedPassword.length < 6) throw new Error('Parol kamida 6 ta belgidan iborat bo‘lishi kerak');

    try {
      const data = await apiRequestAny(CREATE_LAWYER_ENDPOINTS, {
        method: 'POST',
        token: authToken,
        body: { email: normalizedEmail, password: normalizedPassword, name, lawyerId },
      });
      return data;
    } catch {
      if (!USE_LOCAL_FALLBACK) {
        throw new Error('Advokat akkauntini API orqali yaratib bo‘lmadi');
      }

      const users = loadLocalUsers();
      const idx = users.findIndex((u) => String(u.email || '').toLowerCase() === normalizedEmail);

      if (idx >= 0) {
        users[idx] = {
          ...users[idx],
          email: normalizedEmail,
          name: name || users[idx].name || normalizedEmail.split('@')[0],
          password: normalizedPassword,
          role: 'lawyer',
          lawyerId: lawyerId || users[idx].lawyerId || null,
          updatedAt: new Date().toISOString(),
        };
      } else {
        users.push({
          id: `local_lawyer_${Date.now()}`,
          email: normalizedEmail,
          name: name || normalizedEmail.split('@')[0],
          password: normalizedPassword,
          role: 'lawyer',
          lawyerId: lawyerId || null,
          source: 'local',
          created_at: new Date().toISOString(),
        });
      }

      saveLocalUsers(users);
      return {
        success: true,
        fallback: true,
        user: normalizeUser(users[idx >= 0 ? idx : users.length - 1]),
      };
    }
  };

  const getAllUsers = async () => {
    if (!authToken) {
      throw new Error('Token topilmadi. Avval admin sifatida kiring.');
    }

    try {
      const data = await apiRequestAny(USERS_ENDPOINTS, {
        method: 'GET',
        token: authToken,
      });

      const rawList = Array.isArray(data)
        ? data
        : data.users || data.data || data.items || [];

      const users = rawList.map(normalizeUser);
      if (USE_LOCAL_FALLBACK) {
        users.forEach((u) => rememberUserForLocalFeatures(u));
      }
      return users;
    } catch (err) {
      if (!USE_LOCAL_FALLBACK) throw err;
      return loadLocalUsers().map((u) => normalizeUser(u));
    }
  };

  const listSupportConversations = async () => {
    if (!user) throw new Error('Avval tizimga kiring');

    try {
      const data = await apiRequest(CHAT_ENDPOINT, {
        method: 'GET',
        token: authToken,
      });

      const rows = mapChatRows(data);
      return buildConversationsFromChats(rows, user);
    } catch (err) {
      if (!USE_LOCAL_FALLBACK) throw err;
      const all = loadConversations().map(applySupportApproval);
      const filtered = user.role === 'admin'
        ? all
        : user.role === 'lawyer'
          ? all.filter((conv) => conversationMatchesLawyer(conv, user))
          : all.filter((conv) => String(conv.clientId) === String(user.id));

      return toSorted(filtered);
    }
  };

  const ensureSupportConversation = async ({ lawyerId = null } = {}) => {
    if (!user) throw new Error('Avval tizimga kiring');
    if (user.role === 'admin') throw new Error('Admin uchun bu amal kerak emas');

    if (USE_LOCAL_FALLBACK) {
      return ensureLocalConversation({ currentUser: user, lawyerId });
    }

    const currentIdentity = getCurrentIdentity(user);
    const peerId = lawyerId ? normalizeParty(lawyerId) : 'admin';
    const [participantA, participantB] = [currentIdentity, peerId].sort();

    return normalizeConversation({
      id: makeConversationId(currentIdentity, peerId),
      clientId: user.id,
      clientEmail: user.email || '',
      clientName: user.name || user.email || 'Mijoz',
      subject: peerId === 'admin' ? 'Platforma mutaxassisi bilan chat' : `ID ${peerId} bo'yicha murojaat`,
      status: 'open',
      lawyerId: peerId !== 'admin' ? peerId : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      participantA,
      participantB,
      peerId,
    });
  };

  const getSupportMessages = async (conversationId) => {
    if (!conversationId) return [];

    try {
      const data = await apiRequest(CHAT_ENDPOINT, { method: 'GET', token: authToken });
      const rows = mapChatRows(data);
      const filtered = rows
        .filter((row) => makeConversationId(row.sender, row.receiver) === String(conversationId))
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      return filtered.map((row) =>
        normalizeMessage({
          id: row.id,
          conversationId,
          senderId: row.sender,
          senderRole: row.sender === 'admin' ? 'admin' : 'user',
          senderName: row.sender === 'admin' ? 'Platforma admini' : row.sender,
          text: row.message,
          createdAt: row.createdAt,
        })
      );
    } catch (err) {
      if (!USE_LOCAL_FALLBACK) throw err;
      const local = loadMessages()
        .map(normalizeMessage)
        .filter((m) => String(m.conversationId) === String(conversationId));

      return local.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }
  };

  const sendSupportMessage = async ({ conversationId, text, receiver = null }) => {
    if (!user) throw new Error('Avval tizimga kiring');
    if (!conversationId) throw new Error('Suhbat tanlanmagan');
    if (!text?.trim()) throw new Error('Xabar bo‘sh bo‘lishi mumkin emas');

    const trimmed = text.trim();
    const currentIdentity = getCurrentIdentity(user);
    const pair = parseConversationId(conversationId);
    const peerFromConversation = pair
      ? (pair.a === currentIdentity ? pair.b : pair.a)
      : null;
    const peer = normalizeParty(receiver || peerFromConversation || 'admin');

    const payload = {
      message: trimmed,
      type: 'support',
      receiver: peer === 'admin' ? null : peer,
    };

    const approvalMap = normalizeApprovalMap(loadSupportApprovals());
    const approval = approvalMap[String(conversationId)];
    if (user.role !== 'admin' && approval && approval.approved === false) {
      throw new Error('Chat hali admin tomonidan tasdiqlanmagan');
    }

    try {
      const data = await apiRequest(CHAT_ENDPOINT, {
        method: 'POST',
        token: authToken,
        body: payload,
      });
      const chat = normalizeChatRow(data.chat || data.data || data);
      const actualConversationId = makeConversationId(chat.sender, chat.receiver);

      return normalizeMessage({
        id: chat.id,
        conversationId: actualConversationId || conversationId,
        senderId: chat.sender,
        senderRole: chat.sender === 'admin' ? 'admin' : user.role,
        senderName: chat.sender === 'admin' ? 'Platforma admini' : (user.name || user.email || chat.sender),
        text: chat.message || trimmed,
        createdAt: chat.createdAt,
      });
    } catch (err) {
      if (!USE_LOCAL_FALLBACK) throw err;
      const conversations = loadConversations();
      const convIndex = conversations.findIndex((c) => String(c.id) === String(conversationId));

      if (convIndex < 0) throw new Error('Suhbat topilmadi');
      const current = applySupportApproval(conversations[convIndex]);
      if (user.role !== 'admin' && current.requiresApproval && !current.chatApproved) {
        throw new Error('Chat hali admin tomonidan tasdiqlanmagan');
      }

      const message = normalizeMessage({
        id: `msg_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
        conversationId,
        senderId: user.id,
        senderRole: user.role,
        senderName: user.name || user.email,
        text: text.trim(),
        createdAt: new Date().toISOString(),
      });

      const messages = loadMessages();
      messages.push(message);
      saveMessages(messages);

      const updated = {
        ...current,
        lastMessage: message.text,
        updatedAt: message.createdAt,
        unreadForAdmin: user.role === 'admin' ? 0 : Number(current.unreadForAdmin || 0) + 1,
        unreadForClient: user.role === 'admin' ? Number(current.unreadForClient || 0) + 1 : 0,
      };

      conversations[convIndex] = updated;
      saveConversations(conversations);

      return message;
    }
  };

  const setSupportConversationApproval = async (conversationId, approved, meta = {}) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Faqat admin chat ruxsatini boshqara oladi');
    }

    const key = String(conversationId || '').trim();
    if (!key) throw new Error('Conversation ID topilmadi');

    const approvals = normalizeApprovalMap(loadSupportApprovals());
    approvals[key] = {
      approved: Boolean(approved),
      approvedBy: user.email || 'admin',
      updatedAt: new Date().toISOString(),
      lawyerId: meta?.lawyerId || approvals[key]?.lawyerId || null,
    };
    saveSupportApprovals(approvals);

    if (!USE_LOCAL_FALLBACK) {
      return applySupportApproval({
        id: key,
        lawyerId: meta?.lawyerId || null,
        requiresApproval: true,
        chatApproved: Boolean(approved),
      });
    }

    const conversations = loadConversations();
    const idx = conversations.findIndex((c) => String(c.id) === key);

    if (idx >= 0) {
      conversations[idx] = {
        ...normalizeConversation(conversations[idx]),
        requiresApproval: true,
        chatApproved: Boolean(approved),
        approvedBy: user.email || 'admin',
        approvalUpdatedAt: approvals[key].updatedAt,
        updatedAt: new Date().toISOString(),
      };
      saveConversations(conversations);
      return applySupportApproval(conversations[idx]);
    }

    return applySupportApproval({
      id: key,
      lawyerId: meta?.lawyerId || null,
      requiresApproval: true,
      chatApproved: Boolean(approved),
      approvedBy: user.email || 'admin',
      approvalUpdatedAt: approvals[key].updatedAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const setSupportConversationStatus = async (conversationId, status) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Faqat admin statusni o‘zgartira oladi');
    }

    // Yangi backend chat modelida status endpoint yo'q.
    if (!USE_LOCAL_FALLBACK) {
      return normalizeConversation({
        id: conversationId,
        status,
        updatedAt: new Date().toISOString(),
      });
    }

    const conversations = loadConversations();
    const idx = conversations.findIndex((c) => String(c.id) === String(conversationId));

    if (idx < 0) throw new Error('Suhbat topilmadi');

    conversations[idx] = {
      ...normalizeConversation(conversations[idx]),
      status,
      updatedAt: new Date().toISOString(),
    };

    saveConversations(conversations);
    return conversations[idx];
  };

  const isAuthenticated = Boolean(authToken && user);
  const isAdmin = user?.role === 'admin';
  const isLawyer = user?.role === 'lawyer';

  const value = {
    user,
    authToken,
    isAuthenticated,
    isAdmin,
    isLawyer,
    apiBase: API_BASE_URL,
    localFallbackEnabled: USE_LOCAL_FALLBACK,
    supportStatusEnabled: USE_LOCAL_FALLBACK,
    login,
    register,
    sendCode,
    verifyCode,
    logout,
    setManualToken,
    createAdmin,
    createLawyerAccount,
    getAllUsers,
    listSupportConversations,
    ensureSupportConversation,
    getSupportMessages,
    sendSupportMessage,
    setSupportConversationApproval,
    setSupportConversationStatus,
    safeError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
