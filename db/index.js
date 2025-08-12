// db/index.js
const { Pool } = require("pg");

if (!global.pgPool) {
  global.pgPool = new Pool({
    host: process.env.PGHOST || "ep-sweet-scene-a1dro4ii-pooler.ap-southeast-1.aws.neon.tech",
    database: process.env.PGDATABASE || "neondb",
    user: process.env.PGUSER || "neondb_owner",
    password: process.env.PGPASSWORD || "npg_mYrWH3wy0qAn",
    ssl: {
      rejectUnauthorized: false
    },
    // Serverless-friendly settings
    max: 1, // keep low for serverless
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });
}



module.exports = {
  query: (text, params) => global.pgPool.query(text, params),
  pool: global.pgPool
};
