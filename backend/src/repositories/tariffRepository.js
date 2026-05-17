// src/repositories/tariffRepository.js
// Query database untuk data tarif parkir

const { pool } = require("../config/database");

const tariffRepository = {
  // Ambil tarif berdasarkan cabang dan jenis kendaraan
  findByBranchAndType: async (branchId, vehicleType) => {
    const query = `
      SELECT id, branch_id, vehicle_type,
             first_hour_fee, next_hour_fee, daily_max_fee
      FROM tariffs
      WHERE branch_id   = $1
        AND vehicle_type = $2
        AND is_active    = true
    `;
    const result = await pool.query(query, [branchId, vehicleType]);
    return result.rows[0] || null;
  },

  // Ambil semua tarif untuk satu cabang
  findAllByBranch: async (branchId) => {
    const query = `
      SELECT id, vehicle_type,
             first_hour_fee, next_hour_fee, daily_max_fee
      FROM tariffs
      WHERE branch_id = $1
        AND is_active  = true
      ORDER BY vehicle_type
    `;
    const result = await pool.query(query, [branchId]);
    return result.rows;
  },
};

module.exports = tariffRepository;
