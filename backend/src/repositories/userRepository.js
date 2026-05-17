// src/repositories/userRepository.js
// Semua query database yang berhubungan dengan user
// Layer ini HANYA boleh berisi query SQL, tidak ada business logic

const { pool } = require("../config/database");

const userRepository = {
  // Cari user berdasarkan username (untuk login)
  findByUsername: async (username) => {
    const query = `
      SELECT 
        u.id, u.username, u.email, u.password_hash,
        u.full_name, u.role, u.is_active,
        u.branch_id, b.name as branch_name
      FROM users u
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE u.username = $1
    `;
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  },

  // Cari user berdasarkan ID
  findById: async (id) => {
    const query = `
      SELECT 
        u.id, u.username, u.email,
        u.full_name, u.role, u.is_active,
        u.branch_id, b.name as branch_name,
        u.last_login_at, u.created_at
      FROM users u
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  // Update waktu login terakhir
  updateLastLogin: async (userId) => {
    const query = `
      UPDATE users 
      SET last_login_at = NOW() 
      WHERE id = $1
    `;
    await pool.query(query, [userId]);
  },

  // Ambil semua user (untuk admin)
  findAll: async (branchId = null) => {
    let query = `
      SELECT 
        u.id, u.username, u.email, u.full_name,
        u.role, u.is_active, u.last_login_at,
        u.branch_id, b.name as branch_name,
        u.created_at
      FROM users u
      LEFT JOIN branches b ON u.branch_id = b.id
    `;
    const params = [];

    // Filter per cabang jika bukan superadmin
    if (branchId) {
      query += ` WHERE u.branch_id = $1`;
      params.push(branchId);
    }

    query += ` ORDER BY u.created_at DESC`;
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Buat user baru
  create: async (userData) => {
    const query = `
      INSERT INTO users (branch_id, username, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, full_name, role, created_at
    `;
    const params = [
      userData.branch_id,
      userData.username,
      userData.email,
      userData.password_hash,
      userData.full_name,
      userData.role,
    ];
    const result = await pool.query(query, params);
    return result.rows[0];
  },
};

module.exports = userRepository;
