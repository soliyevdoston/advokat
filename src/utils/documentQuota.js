export const DOCUMENT_FREE_QUOTA_KEY = 'legallink_document_free_quota_v1';

export const readDocumentQuotaMap = () => {
  try {
    const raw = localStorage.getItem(DOCUMENT_FREE_QUOTA_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

export const getDocumentQuotaRows = () => {
  const map = readDocumentQuotaMap();
  return Object.entries(map)
    .map(([identity, usedCount]) => ({
      identity,
      usedCount: Number(usedCount) || 0,
      freeUsed: (Number(usedCount) || 0) >= 1,
    }))
    .filter((row) => row.usedCount > 0)
    .sort((a, b) => b.usedCount - a.usedCount);
};

