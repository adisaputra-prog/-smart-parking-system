// src/config/database.js
// Mengelola koneksi ke PostgreSQL menggunakan connection pool
// Pool = sekumpulan koneksi yang siap pakai, lebih efisien daripada
// buka-tutup koneksi setiap request

const { Pool } = require("pg");

// Konfigurasi pool diambil dari environment variables
// JANGAN pernah hardcode password di sini
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  min: parseInt(process.env.DB_POOL_MIN) || 2, // minimum koneksi aktif
  max: parseInt(process.env.DB_POOL_MAX) || 10, // maksimum koneksi aktif
  idleTimeoutMillis: 30000, // koneksi idle dihapus setelah 30 detik
  connectionTimeoutMillis: 5000, // timeout jika tidak bisa konek dalam 5 detik
});

// Event listener untuk monitoring koneksi
pool.on("connect", () => {
  console.log("✅ Database connection established");
});

pool.on("error", (err) => {
  console.error("❌ Unexpected database error:", err.message);
  process.exit(-1); // matikan server jika koneksi database mati
});

// Fungsi untuk test koneksi saat server start
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT NOW() as current_time");
    console.log("✅ Database connected at:", result.rows[0].current_time);
    client.release(); // kembalikan koneksi ke pool
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
