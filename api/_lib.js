/* api/_lib.js - shared helpers for the booking API (runs on Vercel as serverless functions).
   Film data and booking rules come from js/films.js, so the website and the server always agree. */
const crypto = require("crypto");
const SC = require("../js/films.js");

let db = null;

/* Real database: PostgreSQL through the DATABASE_URL environment variable. */
function createPgDb() {
  const { Pool } = require("pg");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 3
  });
  return {
    async query(text, params) {
      const result = await pool.query(text, params);
      return result.rows;
    },
    async tx(work) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const out = await work({
          query: async (text, params) => (await client.query(text, params)).rows
        });
        await client.query("COMMIT");
        return out;
      } catch (err) {
        try { await client.query("ROLLBACK"); } catch (ignore) { /* already closed */ }
        throw err;
      } finally {
        client.release();
      }
    }
  };
}

function getDb() {
  if (!db) {
    if (!process.env.DATABASE_URL) {
      const err = new Error("DATABASE_URL is not set");
      err.code = "NO_DATABASE";
      throw err;
    }
    db = createPgDb();
  }
  return db;
}

/* Used by the tests to plug in a different database. */
function setDb(custom) { db = custom; }

function send(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.status(status).json(body);
}

/* Booking reference such as SC-4F7K2 (no look-alike characters). */
function newReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(5);
  let out = "SC-";
  for (let i = 0; i < 5; i++) { out += alphabet[bytes[i] % alphabet.length]; }
  return out;
}

function cleanReference(value) {
  return String(value || "").trim().toUpperCase();
}

function cleanEmail(value) {
  return String(value || "").trim().toLowerCase();
}

/* Turn a database row (plus its seats) into the JSON the website expects. */
function toBooking(row, seats) {
  return {
    reference: row.reference,
    film: row.film,
    day: row.day,
    time: row.show_time,
    screen: row.screen,
    name: row.customer_name,
    email: row.email,
    seats: seats,
    total: row.total_cents / 100
  };
}

function isSeatConflict(err) {
  return err && err.code === "23505" && /booking_seats/.test(err.constraint || err.message || "");
}

module.exports = { SC, getDb, setDb, send, newReference, cleanReference, cleanEmail, toBooking, isSeatConflict };
