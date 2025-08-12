// db/index.js
const { Pool } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

// Reuse pool in development & serverless
let pool;

if (!global.pgPool) {
  global.pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    max: 1, // limit for serverless
    idleTimeoutMillis: 30000
  });

  global.pgPool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });
}

pool = global.pgPool;

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
