export function normalizeProfileLink(value) {
  const link = typeof value === 'string' ? value.trim() : '';
  if (!link) return '';
  if (link.startsWith('/') && !link.startsWith('//')) return link;

  const normalized = /^[a-z][a-z\d+.-]*:/i.test(link) ? link : `https://${link}`;
  try {
    const url = new URL(normalized);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}
