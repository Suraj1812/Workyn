export const normalizeText = (value = '') =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const getDateKey = (value) => new Date(value).toISOString().slice(0, 10);

export const getNestedValue = (object, path) =>
  path.split('.').reduce((currentValue, segment) => currentValue?.[segment], object);

export const addHours = (date, hours) =>
  new Date(new Date(date).getTime() + hours * 60 * 60 * 1000);

export const fillTemplate = (template = '', context = {}) =>
  template.replace(/\{\{(.*?)\}\}/g, (_match, token) => {
    const value = getNestedValue(context, token.trim());
    return value === undefined || value === null || value === '' ? 'this item' : String(value);
  });
