const lostTicketRepository = require("../repositories/lostTicketRepository");
const parkingRepository = require("../repositories/parkingRepository");
const tariffRepository = require("../repositories/tariffRepository");
const auditRepository = require("../repositories/auditRepository");
const { AppError } = require("../middlewares/errorHandler");
const { calculateFare } = require("../utils/fareCalculator");

const lostTicketService = {
  // Operator/cashier buat request karcis hilang
  createRequest: async ({
    plateNumber,
    vehicleType,
    reason,
    ticketCode,
    branchId,
    requestedBy,
    ipAddress,
  }) => {
    let ticketId = null;
    let feeAmount = 0;

    // Cari tiket jika ada kode tiket
    if (ticketCode) {
      const ticket = await parkingRepository.findByTicketCode(ticketCode);
      if (ticket && ticket.status === "active") {
        ticketId = ticket.id;

        // Hitung tarif
        const tariff = await tariffRepository.findByBranchAndType(
          branchId,
          ticket.vehicle_type,
        );
        if (tariff) {
          const fare = calculateFare(ticket.entry_time, new Date(), tariff);
          feeAmount = fare.fee_amount;
        }
      }
    }

    const request = await lostTicketRepository.create({
      ticket_id: ticketId,
      branch_id: branchId,
      plate_number: plateNumber,
      vehicle_type: vehicleType,
      reason,
      requested_by: requestedBy,
      fee_amount: feeAmount,
    });

    await auditRepository.log({
      userId: requestedBy,
      action: "LOST_TICKET_REQUEST",
      entityType: "lost_ticket_requests",
      entityId: request.id,
      ipAddress,
      newValues: { plate_number: plateNumber, reason },
    });

    return request;
  },

  // Ambil semua request (untuk supervisor/superadmin)
  getAll: async ({ branchId, status }) => {
    return await lostTicketRepository.findAll({ branchId, status });
  },

  // Supervisor approve/reject
  review: async ({
    requestId,
    status,
    reviewNotes,
    reviewedBy,
    branchId,
    ipAddress,
  }) => {
    const request = await lostTicketRepository.findById(requestId);
    if (!request) throw new AppError("Request tidak ditemukan", 404);
    if (request.branch_id !== branchId && reviewedBy.role !== "superadmin") {
      throw new AppError("Akses ditolak", 403);
    }
    if (request.status !== "pending")
      throw new AppError("Request sudah diproses sebelumnya", 400);

    if (!["approved", "rejected"].includes(status)) {
      throw new AppError("Status tidak valid", 400);
    }

    // Kalau approved dan ada ticket_id, update status tiket jadi lost
    if (status === "approved" && request.ticket_id) {
      await parkingRepository.completeTicket(request.ticket_id, {
        duration_mins: 0,
        fee_amount: request.fee_amount,
        gate_exit_id: null,
        operator_exit: reviewedBy,
      });

      // Update status jadi lost
      const { pool } = require("../config/database");
      await pool.query(
        `UPDATE parking_tickets SET status = 'lost' WHERE id = $1`,
        [request.ticket_id],
      );
    }

    const updated = await lostTicketRepository.review(requestId, {
      status,
      reviewedBy,
      reviewNotes,
    });

    await auditRepository.log({
      userId: reviewedBy,
      action:
        status === "approved" ? "LOST_TICKET_APPROVED" : "LOST_TICKET_REJECTED",
      entityType: "lost_ticket_requests",
      entityId: requestId,
      ipAddress,
      newValues: { status, review_notes: reviewNotes },
    });

    return updated;
  },
};

module.exports = lostTicketService;
