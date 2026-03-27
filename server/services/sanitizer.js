const SCRIPT_TAG_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const HTML_TAG_PATTERN = /<\/?[^>]+(>|$)/g;
const CONTROL_CHAR_PATTERN = /[\u0000-\u001F\u007F]/g;

export const sanitizeString = (value) =>
  value
    .replace(SCRIPT_TAG_PATTERN, '')
    .replace(HTML_TAG_PATTERN, '')
    .replace(/[<>]/g, '')
    .replace(CONTROL_CHAR_PATTERN, '')
    .trim();

export const sanitizeDeep = (value) => {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeDeep(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeDeep(nestedValue)]),
    );
  }

  return value;
};

export const slugify = (value) =>
  sanitizeString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 48);
