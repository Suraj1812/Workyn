import { Pool } from 'pg';

let pool;

const parseDatabaseUrl = (connectionString) => {
  const url = new URL(connectionString);
  const sslMode = url.searchParams.get('sslmode');
  const useSsl = process.env.NODE_ENV === 'production' || sslMode === 'require';

  return {
    host: url.hostname,
    port: Number(url.port || 5432),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ''),
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  };
};

export const getPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured.');
    }

    pool = new Pool(parseDatabaseUrl(connectionString));
  }

  return pool;
};

export const query = async (text, params = []) => {
  const database = getPool();
  return database.query(text, params);
};

export const withTransaction = async (callback) => {
  const client = await getPool().connect();

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};
