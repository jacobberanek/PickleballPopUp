const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");

const router = express.Router();

function validPin(pin) {
  return /^\d{4}$/.test(String(pin || ""));
}

/* CREATE ACCOUNT */
router.post("/register", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const pin = String(req.body.pin || "");

    if (!username) {
      return res.status(400).json({
        error: "Username is required",
      });
    }

    if (!validPin(pin)) {
      return res.status(400).json({
        error: "PIN must be exactly 4 digits",
      });
    }

    const existing = await db.query(
      `SELECT UID
       FROM Users
       WHERE LOWER(Username) = LOWER($1)`,
      [username]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "Username already exists",
      });
    }

    const pinHash = await bcrypt.hash(pin, 12);

    const { rows } = await db.query(
      `INSERT INTO Users (Username, PinHash)
       VALUES ($1, $2)
       RETURNING UID, Username`,
      [username, pinHash]
    );

    res.status(201).json({
      uid: rows[0].uid,
      username: rows[0].username,
    });
  } catch (e) {
    console.error("Register error:", e);
    res.status(500).json({
      error: e.message,
    });
  }
});

/* LOGIN */
router.post("/login", async (req, res) => {
  try {
    const username = String(req.body.username || "").trim();
    const pin = String(req.body.pin || "");

    if (!username || !validPin(pin)) {
      return res.status(400).json({
        error: "Username and 4-digit PIN are required",
      });
    }

    const { rows } = await db.query(
      `SELECT UID, Username, PinHash
       FROM Users
       WHERE LOWER(Username) = LOWER($1)`,
      [username]
    );

    const user = rows[0];

    if (!user || !user.pinhash) {
      return res.status(401).json({
        error: "Invalid username or PIN",
      });
    }

    const matches = await bcrypt.compare(
      pin,
      user.pinhash
    );

    if (!matches) {
      return res.status(401).json({
        error: "Invalid username or PIN",
      });
    }

    res.json({
      uid: user.uid,
      username: user.username,
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({
      error: e.message,
    });
  }
});

/* GET USERS */
router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT UID, Username, Email, CreatedAt
       FROM Users
       ORDER BY CreatedAt DESC`
    );

    res.json(rows);
  } catch (e) {
    res.status(500).json({
      error: e.message,
    });
  }
});

module.exports = router;