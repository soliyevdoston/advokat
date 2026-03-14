const CLICK_DEFAULT_BASE = 'https://my.click.uz/services/pay';

const toAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? String(amount) : '';
};

export const buildClickPaymentUrl = ({
  amount,
  plan = 'subscription',
  userEmail = '',
} = {}) => {
  const customUrl = import.meta.env.VITE_CLICK_PAYMENT_URL || '';
  const merchantId = import.meta.env.VITE_CLICK_MERCHANT_ID || '';
  const serviceId = import.meta.env.VITE_CLICK_SERVICE_ID || '';
  const returnUrl = import.meta.env.VITE_CLICK_RETURN_URL || window.location.origin;
  const amountValue = toAmount(amount);

  // Priority 1: ready-made Click URL
  if (customUrl) {
    const url = new URL(customUrl);
    if (amountValue) url.searchParams.set('amount', amountValue);
    if (plan) url.searchParams.set('plan', plan);
    if (userEmail) url.searchParams.set('user_email', userEmail);
    return url.toString();
  }

  // Priority 2: build from merchant/service config
  if (!merchantId || !serviceId) return '';

  const url = new URL(CLICK_DEFAULT_BASE);
  url.searchParams.set('service_id', serviceId);
  url.searchParams.set('merchant_id', merchantId);
  if (amountValue) url.searchParams.set('amount', amountValue);
  if (plan) url.searchParams.set('transaction_param', plan);
  if (userEmail) url.searchParams.set('user_email', userEmail);
  if (returnUrl) url.searchParams.set('return_url', returnUrl);

  return url.toString();
};

export const openClickPayment = (payload = {}) => {
  const checkoutUrl = buildClickPaymentUrl(payload);
  if (!checkoutUrl) return false;
  const appUrl = import.meta.env.VITE_CLICK_APP_URL || '';

  // Agar Click app deep-link berilgan bo'lsa, avval appga o'tishga harakat qiladi,
  // ochilmasa checkout sahifasiga fallback qiladi.
  if (appUrl) {
    const start = Date.now();
    window.location.href = appUrl;
    setTimeout(() => {
      // App ochilib ketgan bo'lsa, browser hidden bo'lishi mumkin.
      if (Date.now() - start < 1800) {
        window.location.href = checkoutUrl;
      }
    }, 900);
    return true;
  }

  // Default: bir zumda sahifaga o'tkazish
  window.location.href = checkoutUrl;
  return true;
};
