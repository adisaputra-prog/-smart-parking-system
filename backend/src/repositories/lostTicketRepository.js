const { pool } = require("../config/database");

const lostTicketRepository = {
  create: async (data) => {
    const query = `
      INSERT INTO lost_ticket_requests
        (ticket_id, branch_id, plate_number, vehicle_type, reason, requested_by, fee_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [
      data.ticket_id || null,
      data.branch_id,
      data.plate_number.toUpperCase(),
      data.vehicle_type,
      data.reason,
      data.requested_by,
      data.fee_amount || 0,
    ]);
    return result.rows[0];
  },

  findAll: async ({ branchId, status }) => {
    let conditions = ["ltr.branch_id = $1"];
    let params = [branchId];
    let idx = 2;

    if (status) {
      conditions.push(`ltr.status = $${idx++}`);
      params.push(status);
    }

    const query = `
      SELECT
        ltr.*,
        u_req.full_name  as requested_by_name,
        u_req.username   as requested_by_username,
        u_rev.full_name  as reviewed_by_name
      FROM lost_ticket_requests ltr
      LEFT JOIN users u_req ON ltr.requested_by = u_req.id
      LEFT JOIN users u_rev ON ltr.reviewed_by  = u_rev.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY ltr.created_at DESC
    `;
    const result = await pool.query(query, params);
    return result.rows;
  },

  findById: async (id) => {
    const query = `
      SELECT ltr.*,
        u_req.full_name as requested_by_name,
        u_rev.full_name as reviewed_by_name
      FROM lost_ticket_requests ltr
      LEFT JOIN users u_req ON ltr.requested_by = u_req.id
      LEFT JOIN users u_rev ON ltr.reviewed_by  = u_rev.id
      WHERE ltr.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  review: async (id, { status, reviewedBy, reviewNotes }) => {
    const query = `
      UPDATE lost_ticket_requests SET
        status       = $1,
        reviewed_by  = $2,
        reviewed_at  = NOW(),
        review_notes = $3,
        updated_at   = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [
      status,
      reviewedBy,
      reviewNotes || null,
      id,
    ]);
    return result.rows[0];
  },
};

module.exports = lostTicketRepository;
