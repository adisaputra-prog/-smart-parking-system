const parkingService = require("../services/parkingService");
const parkingRepository = require("../repositories/parkingRepository");
const { sendSuccess } = require("../utils/response");

const vehicleEntry = async (req, res, next) => {
  try {
    const { plate_number, vehicle_type, gate_entry_id } = req.body;
    const result = await parkingService.vehicleEntry({
      plateNumber: plate_number,
      vehicleType: vehicle_type,
      branchId: req.user.branch_id,
      gateEntryId: gate_entry_id,
      operatorId: req.user.id,
      ipAddress: req.ip,
    });
    return sendSuccess(res, result, "Kendaraan berhasil masuk", 201);
  } catch (error) {
    next(error);
  }
};

const vehicleExit = async (req, res, next) => {
  try {
    const { qr_hash } = req.body;
    const result = await parkingService.vehicleExit({
      qrHash: qr_hash,
      gateExitId: req.body.gate_exit_id,
      operatorId: req.user.id,
      ipAddress: req.ip,
    });
    return sendSuccess(res, result, "Kendaraan berhasil keluar");
  } catch (error) {
    next(error);
  }
};

const getActiveVehicles = async (req, res, next) => {
  try {
    const vehicles = await parkingService.getActiveVehicles(req.user.branch_id);
    return sendSuccess(res, vehicles, "Data kendaraan aktif");
  } catch (error) {
    next(error);
  }
};

const getTodayStats = async (req, res, next) => {
  try {
    const stats = await parkingService.getTodayStats(req.user.branch_id);
    return sendSuccess(res, stats, "Statistik hari ini");
  } catch (error) {
    next(error);
  }
};

const checkTicket = async (req, res, next) => {
  try {
    const ticket = await parkingService.checkTicket(req.params.ticketCode);
    return sendSuccess(res, ticket, "Data tiket");
  } catch (error) {
    next(error);
  }
};

const getCashflow = async (req, res, next) => {
  try {
    const period = req.query.period || "week";
    const data = await parkingRepository.getCashflow(
      req.user.branch_id,
      period,
    );
    return sendSuccess(res, data, "Data cashflow berhasil diambil");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  vehicleEntry,
  vehicleExit,
  getActiveVehicles,
  getTodayStats,
  checkTicket,
  getCashflow,
};
