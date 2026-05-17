// src/repositories/parkingRepository.js
// Semua query database untuk tiket parkir

const { pool } = require("../config/database");

const parkingRepository = {
  // Buat tiket baru saat kendaraan masuk
  createTicket: async (ticketData) => {
    const query = `
      INSERT INTO parking_tickets (
        ticket_code, branch_id, plate_number,
        vehicle_type, qr_code_hash,
        gate_entry_id, operator_entry
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const params = [
      ticketData.ticket_code,
      ticketData.branch_id,
      ticketData.plate_number.toUpperCase(),
      ticketData.vehicle_type,
      ticketData.qr_code_hash,
      ticketData.gate_entry_id || null,
      ticketData.operator_entry,
    ];
    const result = await pool.query(query, params);
    return result.rows[0];
  },

  // Cari tiket berdasarkan QR hash (saat scan keluar)
  findByQRHash: async (qrHash) => {
    const query = `
      SELECT 
        pt.*,
        b.name as branch_name,
        g_entry.name as gate_entry_name,
        g_exit.name  as gate_exit_name
      FROM parking_tickets pt
      LEFT JOIN branches b        ON pt.branch_id    = b.id
      LEFT JOIN gates g_entry     ON pt.gate_entry_id = g_entry.id
      LEFT JOIN gates g_exit      ON pt.gate_exit_id  = g_exit.id
      WHERE pt.qr_code_hash = $1
    `;
    const result = await pool.query(query, [qrHash]);
    return result.rows[0] || null;
  },

  // Cari tiket berdasarkan kode tiket
  findByTicketCode: async (ticketCode) => {
    const query = `
      SELECT pt.*, b.name as branch_name
      FROM parking_tickets pt
      LEFT JOIN branches b ON pt.branch_id = b.id
      WHERE pt.ticket_code = $1
    `;
    const result = await pool.query(query, [ticketCode]);
    return result.rows[0] || null;
  },

  // Cek apakah plat nomor masih ada di dalam (status active)
  findActiveByPlate: async (plateNumber, branchId) => {
    const query = `
      SELECT id, ticket_code, plate_number, entry_time, status
      FROM parking_tickets
      WHERE plate_number = $1
        AND branch_id    = $2
        AND status       = 'active'
    `;
    const result = await pool.query(query, [
      plateNumber.toUpperCase(),
      branchId,
    ]);
    return result.rows[0] || null;
  },

  // Update tiket saat kendaraan keluar
  completeTicket: async (ticketId, exitData) => {
    const query = `
      UPDATE parking_tickets SET
        exit_time      = NOW(),
        duration_mins  = $1,
        fee_amount     = $2,
        status         = 'completed',
        gate_exit_id   = $3,
        operator_exit  = $4,
        updated_at     = NOW()
      WHERE id = $5
      RETURNING *
    `;
    const params = [
      exitData.duration_mins,
      exitData.fee_amount,
      exitData.gate_exit_id || null,
      exitData.operator_exit,
      ticketId,
    ];
    const result = await pool.query(query, params);
    return result.rows[0];
  },

  // Ambil daftar kendaraan aktif (untuk dashboard)
  findActiveTickets: async (branchId) => {
    const query = `
      SELECT 
        pt.id, pt.ticket_code, pt.plate_number,
        pt.vehicle_type, pt.entry_time, pt.status,
        EXTRACT(EPOCH FROM (NOW() - pt.entry_time))/60 AS duration_mins_so_far,
        u.full_name as operator_name,
        g.name as gate_entry_name
      FROM parking_tickets pt
      LEFT JOIN users u ON pt.operator_entry = u.id
      LEFT JOIN gates g ON pt.gate_entry_id  = g.id
      WHERE pt.branch_id = $1
        AND pt.status    = 'active'
      ORDER BY pt.entry_time DESC
    `;
    const result = await pool.query(query, [branchId]);
    return result.rows;
  },

  // Statistik hari ini untuk dashboard
  getTodayStats: async (branchId) => {
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE status = 'active')                    AS active_vehicles,
        COUNT(*) FILTER (WHERE DATE(entry_time) = CURRENT_DATE)      AS total_entry_today,
        COUNT(*) FILTER (WHERE DATE(exit_time)  = CURRENT_DATE
                           AND status = 'completed')                  AS total_exit_today,
        COALESCE(SUM(fee_amount) FILTER (
          WHERE DATE(exit_time) = CURRENT_DATE
            AND status = 'completed'), 0)                             AS revenue_today
      FROM parking_tickets
      WHERE branch_id = $1
    `;
    const result = await pool.query(query, [branchId]);
    return result.rows[0];
  },
};

module.exports = parkingRepository;
