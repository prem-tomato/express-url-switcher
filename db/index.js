const { Pool } = require("pg");

if (!global.pgPool) {
  global.pgPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_mYrWH3wy0qAn@ep-sweet-scene-a1dro4ii-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    max: 1,
    min: 0,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: true
  });
}

module.exports = {
  query: async (text, params) => {
    const client = await global.pgPool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  },
  pool: global.pgPool
};