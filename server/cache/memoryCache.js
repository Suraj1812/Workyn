const store = new Map();

const isExpired = (entry) => entry.expiresAt && entry.expiresAt <= Date.now();

export const getCache = (key) => {
  const entry = store.get(key);

  if (!entry) {
    return null;
  }

  if (isExpired(entry)) {
    store.delete(key);
    return null;
  }

  return entry.value;
};

export const setCache = (key, value, ttlMs = 30_000) => {
  store.set(key, {
    value,
    expiresAt: ttlMs ? Date.now() + ttlMs : null,
  });

  return value;
};

export const deleteCache = (key) => {
  store.delete(key);
};

export const invalidateCachePrefix = (prefix) => {
  Array.from(store.keys()).forEach((key) => {
    if (key.startsWith(prefix)) {
      store.delete(key);
    }
  });
};

export const withCache = async (key, producer, ttlMs = 30_000) => {
  const cached = getCache(key);
  if (cached !== null) {
    return cached;
  }

  const value = await producer();
  setCache(key, value, ttlMs);
  return value;
};
