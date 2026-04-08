const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const CASE_NAVIGATOR_PRICE_UZS = 149000;
export const CASE_NAVIGATOR_PRICE_LABEL = '149 000 UZS';

export const CASE_NAVIGATOR_OPTIONS = {
  urgency: [
    { value: 'low', label: 'Shoshilinch emas' },
    { value: 'medium', label: '2-3 kun ichida kerak' },
    { value: 'high', label: 'Bugun hal bo\'lishi kerak' },
  ],
  topic: [
    { value: 'consultation', label: 'Maslahat / tushuntirish' },
    { value: 'document', label: 'Hujjat tayyorlash' },
    { value: 'dispute', label: 'Nizo yoki sud masalasi' },
    { value: 'business', label: 'Biznes huquqi' },
    { value: 'labor', label: 'Mehnat huquqi' },
    { value: 'family', label: 'Oilaviy huquq' },
    { value: 'criminal', label: 'Jinoyat ishlari' },
    { value: 'international', label: 'Xalqaro huquq' },
  ],
  style: [
    { value: 'ai', label: 'Avval yo\'l xarita va tayyorgarlik' },
    { value: 'expert', label: 'Darhol advokat bilan davom etaman' },
  ],
  budget: [
    { value: 'limited', label: 'Cheklangan budjet' },
    { value: 'moderate', label: 'O\'rtacha budjet' },
    { value: 'flexible', label: 'Moslashuvchan budjet' },
  ],
  region: [
    { value: 'toshkent', label: 'Toshkent shahri' },
    { value: 'viloyat', label: 'Viloyat / tuman' },
    { value: 'xorij', label: 'Chet eldan murojaat' },
  ],
};

const URGENCY_SCORE = {
  low: 14,
  medium: 33,
  high: 58,
};

const TOPIC_SCORE = {
  consultation: 14,
  document: 12,
  dispute: 32,
  business: 21,
  labor: 22,
  family: 20,
  criminal: 38,
  international: 28,
};

const STYLE_SCORE = {
  ai: 6,
  expert: 17,
};

const BUDGET_SCORE = {
  limited: 10,
  moderate: 6,
  flexible: 2,
};

const REGION_SCORE = {
  toshkent: 4,
  viloyat: 7,
  xorij: 9,
};

const TOPIC_TO_SPECIALIZATION = {
  consultation: 'civil',
  document: 'civil',
  dispute: 'civil',
  business: 'business',
  labor: 'labor',
  family: 'family',
  criminal: 'criminal',
  international: 'international',
};

const TOPIC_LABELS = CASE_NAVIGATOR_OPTIONS.topic.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const URGENCY_LABELS = CASE_NAVIGATOR_OPTIONS.urgency.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

export const SPECIALIZATION_LABELS = {
  civil: 'Fuqarolik huquqi',
  criminal: 'Jinoyat huquqi',
  business: 'Biznes huquqi',
  labor: 'Mehnat huquqi',
  family: 'Oilaviy huquq',
  international: 'Xalqaro huquq',
  inheritance: 'Meros huquqi',
};

const REQUIRED_DOCS_MAP = {
  consultation: ['Pasport yoki ID karta nusxasi', 'Masala bo\'yicha asosiy dalillar', 'Avvalgi yozishmalar (bo\'lsa)'],
  document: ['Ariza beruvchi ma\'lumotlari', 'Mavzuga oid dalolatnoma yoki hujjat nusxasi', 'Aniq talab va muddatlar ro\'yxati'],
  dispute: ['Da\'vo yoki e\'tiroz matni', 'Shartnoma yoki kelishuv nusxasi', 'Dalil materiallari (foto/video/skrin)'],
  business: ['Kompaniya rekvizitlari', 'Shartnoma loyihasi yoki amaldagi nusxa', 'Soliq/yuridik holat bo\'yicha mavjud hujjatlar'],
  labor: ['Mehnat shartnomasi nusxasi', 'Buyruq/xat/ogohlantirishlar', 'Ish haqi va davomatga oid dalillar'],
  family: ['Nikoh/ajrashish hujjatlari', 'Bolalar bo\'yicha hujjatlar', 'Mol-mulkka oid hujjatlar'],
  criminal: ['Bayonnoma yoki qaror nusxasi', 'Advokat orderi uchun shaxsiy ma\'lumotlar', 'Guvohlar va dalillar ro\'yxati'],
  international: ['Pasport va migratsiya hujjatlari', 'Xalqaro shartnoma/bitim matni', 'Tarjima talab qilinadigan fayllar'],
};

const TOPIC_PLAN_INTROS = {
  consultation: 'Masala bo\'yicha huquqiy pozitsiyani aniq qilib olamiz.',
  document: 'Hujjatni qonunchilik talablariga mos formatda tayyorlaymiz.',
  dispute: 'Nizoni sudgacha hal qilish va sudga tayyorlanish parallel olib boriladi.',
  business: 'Biznes uchun risklarni kamaytiruvchi huquqiy yo\'l xarita tuziladi.',
  labor: 'Ish beruvchi-xodim nizosida dalillarni to\'g\'ri tartiblash muhim.',
  family: 'Oilaviy nizoda hujjatlar va manfaatlar balansini birinchi o\'ringa qo\'yamiz.',
  criminal: 'Jinoyat ishlarida birinchi soatlardagi yondashuv natijaga kuchli ta\'sir qiladi.',
  international: 'Xalqaro ishlar uchun mahalliy va xorijiy talablar mosligi tekshiriladi.',
};

const getLabel = (map, value) => map[value] || value || '-';

export const getTopicLabel = (value) => getLabel(TOPIC_LABELS, value);
export const getUrgencyLabel = (value) => getLabel(URGENCY_LABELS, value);
export const getSpecializationLabel = (value) => SPECIALIZATION_LABELS[value] || value || '-';

const resolveSpecialization = ({ topic, urgency }) => {
  if (topic === 'dispute' && urgency === 'high') {
    return 'criminal';
  }
  return TOPIC_TO_SPECIALIZATION[topic] || 'civil';
};

const buildRiskSummary = ({ topic, urgency, riskLevel, riskScore, recommendedSpecialization }) => {
  const riskText = riskLevel === 'high' ? 'yuqori' : riskLevel === 'medium' ? 'o\'rta' : 'past';
  const topicLabel = getTopicLabel(topic);
  const urgencyLabel = getUrgencyLabel(urgency);
  const specializationLabel = getSpecializationLabel(recommendedSpecialization);

  return `${topicLabel} bo'yicha murojaat ${urgencyLabel.toLowerCase()} darajada belgilandi. Risk profili ${riskText} (${riskScore}/100). Tavsiya: ${specializationLabel} yo'nalishidagi advokat bilan davom etish.`;
};

const buildFullPlan = ({ topic, riskLevel, style, region }) => {
  const riskHint = riskLevel === 'high'
    ? 'Yuqori risk sabab birinchi 24 soatda advokat bilan bog\'lanish shart.'
    : riskLevel === 'medium'
      ? 'O\'rta risk holatda 48 soat ichida hujjatlar to\'liq yig\'ilishi kerak.'
      : 'Past risk holatda ham rasmiy yozishmalarni to\'g\'ri formatda yuriting.';

  const regionHint = region === 'xorij'
    ? 'Agar murojaat xorijdan bo\'lsa, tarjima va apostil talablari oldindan tekshiriladi.'
    : region === 'viloyat'
      ? 'Hududiy sud/idora yurisdiksiyasini oldindan aniqlab oling.'
      : 'Toshkent bo\'yicha tegishli idora va sud yurisdiksiyasi tezda aniqlanadi.';

  const styleHint = style === 'expert'
    ? 'Advokat bilan birinchi qo\'ng\'iroqda savollar ro\'yxatini tayyorlab kiring.'
    : 'Avval qisqa huquqiy reja tayyorlab, keyin advokatga uzating.';

  return [
    `1-kun: Holatni qisqacha protokol qiling. ${TOPIC_PLAN_INTROS[topic] || TOPIC_PLAN_INTROS.consultation}`,
    '2-kun: Asosiy hujjatlar va dalillarni bitta papkaga jamlang, fayllarni nomlab chiqing.',
    `3-kun: Rasmiy murojaat matnining birinchi draftini tayyorlang. ${styleHint}`,
    `4-kun: Risk tekshiruvi va ehtimoliy qarshi pozitsiyalar ro'yxatini tuzing. ${riskHint}`,
    '5-kun: Muddatlar kalendarini belgilang (idora javobi, sud sanasi, qo\'shimcha hujjatlar).',
    `6-kun: Hudud va vakolat masalalarini yakuniy tekshiring. ${regionHint}`,
    '7-kun: Yakuniy paketni tasdiqlang va arizani yuboring yoki advokatga biriktiring.',
  ];
};

const buildShortSteps = (fullPlan = []) => fullPlan.slice(0, 2);

const normalizeInput = (input = {}) => {
  const normalized = {
    urgency: String(input.urgency || 'medium').toLowerCase(),
    topic: String(input.topic || 'consultation').toLowerCase(),
    style: String(input.style || 'ai').toLowerCase(),
    budget: String(input.budget || 'moderate').toLowerCase(),
    region: String(input.region || 'toshkent').toLowerCase(),
  };

  if (!URGENCY_SCORE[normalized.urgency]) normalized.urgency = 'medium';
  if (!TOPIC_SCORE[normalized.topic]) normalized.topic = 'consultation';
  if (!STYLE_SCORE[normalized.style]) normalized.style = 'ai';
  if (!BUDGET_SCORE[normalized.budget]) normalized.budget = 'moderate';
  if (!REGION_SCORE[normalized.region]) normalized.region = 'toshkent';

  return normalized;
};

export function evaluateCaseNavigator(input = {}) {
  const normalized = normalizeInput(input);
  const { urgency, topic, style, budget, region } = normalized;

  let riskScore =
    (URGENCY_SCORE[urgency] || 0)
    + (TOPIC_SCORE[topic] || 0)
    + (STYLE_SCORE[style] || 0)
    + (BUDGET_SCORE[budget] || 0)
    + (REGION_SCORE[region] || 0);

  if (urgency === 'high' && ['dispute', 'criminal'].includes(topic)) {
    riskScore += 14;
  }

  if (topic === 'document' && urgency === 'low') {
    riskScore -= 12;
  }

  if (style === 'expert' && budget === 'limited') {
    riskScore += 5;
  }

  riskScore = clamp(Math.round(riskScore), 8, 98);

  const riskLevel = riskScore >= 75 ? 'high' : riskScore >= 45 ? 'medium' : 'low';
  const recommendedSpecialization = resolveSpecialization({ topic, urgency });
  const fullPlan = buildFullPlan({ topic, riskLevel, style, region });
  const requiredDocs = REQUIRED_DOCS_MAP[topic] || REQUIRED_DOCS_MAP.consultation;

  return {
    riskScore,
    riskLevel,
    recommendedSpecialization,
    summary: buildRiskSummary({ topic, urgency, riskLevel, riskScore, recommendedSpecialization }),
    shortNextSteps: buildShortSteps(fullPlan),
    fullPlan,
    requiredDocs,
  };
}

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getWinRate = (lawyer = {}) => {
  const total = toNumber(lawyer?.cases?.total, 0);
  const won = toNumber(lawyer?.cases?.won, 0);
  if (!total) return 0;
  return (won / total) * 100;
};

export function matchLawyerForCase(result, lawyers = []) {
  if (!Array.isArray(lawyers) || !lawyers.length || !result) return null;

  const recommended = String(result.recommendedSpecialization || '').toLowerCase();

  const scored = lawyers
    .map((lawyer) => {
      const specialization = String(lawyer?.specialization || '').toLowerCase();
      const rating = toNumber(lawyer?.rating, 0);
      const reviews = toNumber(lawyer?.reviews, 0);
      const winRate = getWinRate(lawyer);
      const specializationBonus = specialization === recommended ? 35 : 0;
      const score = specializationBonus + rating * 12 + Math.min(reviews, 200) * 0.1 + winRate * 0.3;
      return { lawyer, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.lawyer || null;
}
