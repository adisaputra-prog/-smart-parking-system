// src/services/parkingService.js
// Business logic utama sistem parkir
// Di sini semua aturan bisnis diterapkan

const parkingRepository = require("../repositories/parkingRepository");
const tariffRepository = require("../repositories/tariffRepository");
const auditRepository = require("../repositories/auditRepository");
const {
  generateTicketCode,
  generateQRHash,
  generateQRCode,
} = require("../utils/ticketGenerator");
const { calculateFare, formatRupiah } = require("../utils/fareCalculator");
const { AppError } = require("../middlewares/errorHandler");
const { AUDIT_ACTIONS, TICKET_STATUS } = require("../config/constants");

const parkingService = {
  // PROSES KENDARAAN MASUK
  vehicleEntry: async ({
    plateNumber,
    vehicleType,
    branchId,
    gateEntryId,
    operatorId,
    ipAddress,
  }) => {
    // 1. Cek apakah plat nomor sudah ada di dalam (anti duplicate)
    const existingTicket = await parkingRepository.findActiveByPlate(
      plateNumber,
      branchId,
    );
    if (existingTicket) {
      throw new AppError(
        `Kendaraan ${plateNumber} masih tercatat di dalam sejak ${existingTicket.entry_time}. Selesaikan tiket sebelumnya dahulu.`,
        409,
      );
    }

    // 2. Cek apakah tarif tersedia untuk jenis kendaraan ini
    const tariff = await tariffRepository.findByBranchAndType(
      branchId,
      vehicleType,
    );
    if (!tariff) {
      throw new AppError(
        `Tarif untuk kendaraan ${vehicleType} belum dikonfigurasi`,
        400,
      );
    }

    // 3. Generate kode tiket dan QR hash
    const ticketCode = generateTicketCode();
    const entryTime = new Date().toISOString();
    const qrHash = generateQRHash(ticketCode, plateNumber, entryTime);

    // 4. Simpan tiket ke database
    const ticket = await parkingRepository.createTicket({
      ticket_code: ticketCode,
      branch_id: branchId,
      plate_number: plateNumber,
      vehicle_type: vehicleType,
      qr_code_hash: qrHash,
      gate_entry_id: gateEntryId,
      operator_entry: operatorId,
    });

    // 5. Generate QR code image (base64)
    const qrCodeImage = await generateQRCode(qrHash);

    // 6. Catat ke audit log
    await auditRepository.log({
      userId: operatorId,
      action: AUDIT_ACTIONS.VEHICLE_ENTRY,
      entityType: "parking_ticket",
      entityId: ticket.id,
      ipAddress,
      newValues: {
        ticket_code: ticketCode,
        plate_number: plateNumber,
        vehicle_type: vehicleType,
      },
    });

    return {
      ticket_id: ticket.id,
      ticket_code: ticketCode,
      plate_number: plateNumber.toUpperCase(),
      vehicle_type: vehicleType,
      entry_time: ticket.entry_time,
      qr_code: qrCodeImage, // base64 image untuk dicetak
      tariff: {
        first_hour: formatRupiah(tariff.first_hour_fee),
        next_hour: formatRupiah(tariff.next_hour_fee),
        daily_max: formatRupiah(tariff.daily_max_fee),
      },
    };
  },

  // PROSES KENDARAAN KELUAR
  vehicleExit: async ({ qrHash, gateExitId, operatorId, ipAddress }) => {
    // 1. Cari tiket berdasarkan QR hash
    const ticket = await parkingRepository.findByQRHash(qrHash);
    if (!ticket) {
      throw new AppError("QR Code tidak valid atau tidak ditemukan", 404);
    }

    // 2. Validasi status tiket
    if (ticket.status === TICKET_STATUS.COMPLETED) {
      throw new AppError(
        "Tiket ini sudah digunakan untuk keluar sebelumnya",
        409,
      );
    }
    if (ticket.status === TICKET_STATUS.VOIDED) {
      throw new AppError("Tiket ini sudah dibatalkan", 400);
    }
    if (ticket.status !== TICKET_STATUS.ACTIVE) {
      throw new AppError("Status tiket tidak valid", 400);
    }

    // 3. Ambil tarif untuk hitung biaya
    const tariff = await tariffRepository.findByBranchAndType(
      ticket.branch_id,
      ticket.vehicle_type,
    );
    if (!tariff) {
      throw new AppError("Konfigurasi tarif tidak ditemukan", 500);
    }

    // 4. Hitung durasi dan tarif
    const fareResult = calculateFare(ticket.entry_time, new Date(), tariff);

    // 5. Update tiket di database
    const completedTicket = await parkingRepository.completeTicket(ticket.id, {
      duration_mins: fareResult.duration_mins,
      fee_amount: fareResult.fee_amount,
      gate_exit_id: gateExitId,
      operator_exit: operatorId,
    });

    // 6. Catat ke audit log
    await auditRepository.log({
      userId: operatorId,
      action: AUDIT_ACTIONS.VEHICLE_EXIT,
      entityType: "parking_ticket",
      entityId: ticket.id,
      ipAddress,
      oldValues: { status: "active" },
      newValues: {
        status: "completed",
        duration_mins: fareResult.duration_mins,
        fee_amount: fareResult.fee_amount,
      },
    });

    return {
      ticket_id: ticket.id,
      ticket_code: ticket.ticket_code,
      plate_number: ticket.plate_number,
      vehicle_type: ticket.vehicle_type,
      entry_time: fareResult.entry_time,
      exit_time: fareResult.exit_time,
      duration_mins: fareResult.duration_mins,
      total_hours: fareResult.total_hours,
      fee_amount: fareResult.fee_amount,
      fee_formatted: formatRupiah(fareResult.fee_amount),
    };
  },

  // AMBIL KENDARAAN AKTIF (dashboard)
  getActiveVehicles: async (branchId) => {
    return await parkingRepository.findActiveTickets(branchId);
  },

  // STATISTIK HARI INI
  getTodayStats: async (branchId) => {
    const stats = await parkingRepository.getTodayStats(branchId);
    return {
      active_vehicles: parseInt(stats.active_vehicles),
      total_entry_today: parseInt(stats.total_entry_today),
      total_exit_today: parseInt(stats.total_exit_today),
      revenue_today: parseInt(stats.revenue_today),
      revenue_formatted: formatRupiah(parseInt(stats.revenue_today)),
    };
  },

  // CEK TIKET (untuk validasi manual)
  checkTicket: async (ticketCode) => {
    const ticket = await parkingRepository.findByTicketCode(ticketCode);
    if (!ticket) {
      throw new AppError("Tiket tidak ditemukan", 404);
    }
    return ticket;
  },
};

module.exports = parkingService;
