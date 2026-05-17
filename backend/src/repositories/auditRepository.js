// src/repositories/auditRepository.js
// Semua query untuk audit log
// Setiap aksi penting di sistem harus dicatat di sini

const { pool } = require("../config/database");

const auditRepository = {
  // Catat aksi ke audit log
  log: async ({
    userId,
    action,
    entityType,
    entityId,
    ipAddress,
    userAgent,
    oldValues,
    newValues,
    metadata,
  }) => {
    const query = `
      INSERT INTO audit_logs 
        (user_id, action, entity_type, entity_id, ip_address, user_agent, old_values, new_values, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    const params = [
      userId || null,
      action,
      entityType || null,
      entityId || null,
      ipAddress || null,
      userAgent || null,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      metadata ? JSON.stringify(metadata) : null,
    ];
    const result = await pool.query(query, params);
    return result.rows[0];
  },

  // Ambil audit log dengan filter
  findAll: async ({
    page = 1,
    limit = 20,
    userId,
    action,
    startDate,
    endDate,
  }) => {
    let conditions = [];
    let params = [];
    let idx = 1;

    if (userId) {
      conditions.push(`user_id = $${idx++}`);
      params.push(userId);
    }
    if (action) {
      conditions.push(`action = $${idx++}`);
      params.push(action);
    }
    if (startDate) {
      conditions.push(`created_at >= $${idx++}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`created_at <= $${idx++}`);
      params.push(endDate);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        al.id, al.action, al.entity_type, al.entity_id,
        al.ip_address, al.metadata, al.created_at,
        u.username, u.full_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ${where}
      ORDER BY al.created_at DESC
      LIMIT $${idx++} OFFSET $${idx}
    `;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  },
};

module.exports = auditRepository;
