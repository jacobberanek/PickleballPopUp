
require('dotenv').config()
const express = require("express");
const cors = require("cors");
const gamesRouter = require("./src/routes/games");
const usersRouter = require("./src/routes/users");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));
app.use(express.json());

app.use("/api/games", gamesRouter);
app.use("/api/users", usersRouter);

// Run schema on startup to create tables if they don't exist
const db = require("./src/db");
const fs = require("fs");
const path = require("path");

async function initDb() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, "db/schema.sql"), "utf8");
    await db.query(schema);
    console.log("Database ready");
  } catch (e) {
    console.error("DB init error:", e.message);
  }
}

const PORT = process.env.PORT || 3001;

async function start() {
  await initDb();
  app.listen(PORT, () => console.log(`Server on ${PORT}`));
}

start();
