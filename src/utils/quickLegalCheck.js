const QUICK_LEGAL_CHECK_KEY = 'legallink_quick_check_v1';

const LABELS = {
  urgency: {
    low: 'Shoshilinch emas',
    medium: '2-3 kun ichida kerak',
    high: 'Bugun hal qilish kerak',
  },
  topic: {
    document: 'Hujjat tayyorlash',
    consult: 'Maslahat / tushuntirish',
    dispute: 'Nizo yoki sud ishi',
  },
  style: {
    ai: 'Avval AI bilan boshlash',
    expert: 'Darhol mutaxassis kerak',
  },
};

export const formatQuickCheckPrompt = (payload = {}) => {
  const urgency = LABELS.urgency[payload.urgency] || payload.urgency || '-';
  const topic = LABELS.topic[payload.topic] || payload.topic || '-';
  const style = LABELS.style[payload.style] || payload.style || '-';

  return [
    "Tez Legal Check natijam:",
    `- Muammo shoshilinchligi: ${urgency}`,
    `- Murojaat turi: ${topic}`,
    `- Yondashuv: ${style}`,
    '',
    "Shu ma'lumotlar asosida menga aniq keyingi qadamlarni yozib bering.",
  ].join('\n');
};

export const saveQuickLegalCheck = (payload = {}) => {
  const data = {
    ...payload,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(QUICK_LEGAL_CHECK_KEY, JSON.stringify(data));
};

export const readQuickLegalCheck = () => {
  try {
    const raw = localStorage.getItem(QUICK_LEGAL_CHECK_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearQuickLegalCheck = () => {
  localStorage.removeItem(QUICK_LEGAL_CHECK_KEY);
};

