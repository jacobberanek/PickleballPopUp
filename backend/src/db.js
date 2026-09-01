const { Pool } = require("pg");

const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || "");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

const db = {
  query: (text, params) => pool.query(text, params),
};

module.exports = db;