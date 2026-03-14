const toAmount = (value) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? String(n) : '';
};

const withParams = (baseUrl, params = {}) => {
  if (!baseUrl) return '';
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value) !== '') {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
};

const buildClickUrl = ({ amount, plan, userEmail }) => {
  const direct = import.meta.env.VITE_CLICK_PAYMENT_URL || '';
  if (direct) {
    return withParams(direct, { amount: toAmount(amount), plan, user_email: userEmail });
  }

  const merchantId = import.meta.env.VITE_CLICK_MERCHANT_ID || '';
  const serviceId = import.meta.env.VITE_CLICK_SERVICE_ID || '';
  if (!merchantId || !serviceId) return '';

  return withParams('https://my.click.uz/services/pay', {
    merchant_id: merchantId,
    service_id: serviceId,
    amount: toAmount(amount),
    transaction_param: plan,
    user_email: userEmail,
    return_url: import.meta.env.VITE_CLICK_RETURN_URL || window.location.origin,
  });
};

const buildPaymeUrl = ({ amount, plan, userEmail }) => {
  const direct = import.meta.env.VITE_PAYME_PAYMENT_URL || '';
  if (!direct) return '';
  return withParams(direct, { amount: toAmount(amount), plan, user_email: userEmail });
};

export const openPaymentGateway = ({ gateway, amount, plan = 'subscription', userEmail = '' }) => {
  const type = String(gateway || '').toLowerCase();

  if (type === 'click') {
    const appUrl = import.meta.env.VITE_CLICK_APP_URL || '';
    const checkoutUrl = buildClickUrl({ amount, plan, userEmail });
    if (!checkoutUrl) return false;

    if (appUrl) {
      window.location.href = appUrl;
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 900);
      return true;
    }

    window.location.href = checkoutUrl;
    return true;
  }

  if (type === 'payme') {
    const appUrl = import.meta.env.VITE_PAYME_APP_URL || '';
    const checkoutUrl = buildPaymeUrl({ amount, plan, userEmail });
    if (!checkoutUrl) return false;

    if (appUrl) {
      window.location.href = appUrl;
      setTimeout(() => {
        window.location.href = checkoutUrl;
      }, 900);
      return true;
    }

    window.location.href = checkoutUrl;
    return true;
  }

  return false;
};
