const formatMeta = (meta = {}) => (Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '');

const writeLog = (level, message, meta = {}) => {
  const prefix = `[${new Date().toISOString()}] ${level.toUpperCase()}`;
  const line = `${prefix} ${message}${formatMeta(meta)}`;

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
};

export const logger = {
  info: (message, meta) => writeLog('info', message, meta),
  warn: (message, meta) => writeLog('warn', message, meta),
  error: (message, meta) => writeLog('error', message, meta),
};

export const morganStream = {
  write: (message) => {
    const trimmed = message.trim();
    if (trimmed) {
      logger.info(trimmed);
    }
  },
};
