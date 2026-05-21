const { pool } = require("../config/database");

const userRepository = {
  findByUsername: async (username) => {
    const query = `
      SELECT u.id, u.username, u.email, u.password_hash,
             u.full_name, u.role, u.is_active,
             u.branch_id, b.name as branch_name
      FROM users u
      LEFT JOIN branches b ON u.branch_id = b.id
      WHERE u.username = $1
    `;
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  },

  findById: async (id) => {
    const query = `
      SELECT u.id, u.username, u.email,
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

  updateLastLogin: async (userId) => {
    const query = `UPDATE users SET last_login_at = NOW() WHERE id = $1`;
    await pool.query(query, [userId]);
  },

  findAll: async (branchId = null) => {
    let query = `
      SELECT u.id, u.username, u.email, u.full_name,
             u.role, u.is_active, u.last_login_at,
             u.branch_id, b.name as branch_name, u.created_at
      FROM users u
      LEFT JOIN branches b ON u.branch_id = b.id
    `;
    const params = [];
    if (branchId) {
      query += ` WHERE u.branch_id = $1`;
      params.push(branchId);
    }
    query += ` ORDER BY u.created_at DESC`;
    const result = await pool.query(query, params);
    return result.rows;
  },

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

  update: async (id, userData) => {
    const fields = [];
    const params = [];
    let idx = 1;

    if (userData.full_name) {
      fields.push(`full_name = $${idx++}`);
      params.push(userData.full_name);
    }
    if (userData.email) {
      fields.push(`email = $${idx++}`);
      params.push(userData.email);
    }
    if (userData.role) {
      fields.push(`role = $${idx++}`);
      params.push(userData.role);
    }
    if (userData.password_hash) {
      fields.push(`password_hash = $${idx++}`);
      params.push(userData.password_hash);
    }
    if (userData.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      params.push(userData.is_active);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE users SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING id, username, email, full_name, role, is_active, updated_at
    `;
    const result = await pool.query(query, params);
    return result.rows[0];
  },

  deactivate: async (id) => {
    const query = `
      UPDATE users SET is_active = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, is_active
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },
};

module.exports = userRepository;
