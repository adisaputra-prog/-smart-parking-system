const lostTicketService = require("../services/lostTicketService");
const { sendSuccess } = require("../utils/response");

const createRequest = async (req, res, next) => {
  try {
    const { plate_number, vehicle_type, reason, ticket_code } = req.body;
    const result = await lostTicketService.createRequest({
      plateNumber: plate_number,
      vehicleType: vehicle_type,
      reason,
      ticketCode: ticket_code,
      branchId: req.user.branch_id,
      requestedBy: req.user.id,
      ipAddress: req.ip,
    });
    return sendSuccess(
      res,
      result,
      "Request karcis hilang berhasil dibuat",
      201,
    );
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { status } = req.query;
    const result = await lostTicketService.getAll({
      branchId: req.user.branch_id,
      status,
    });
    return sendSuccess(res, result, "Data request karcis hilang");
  } catch (error) {
    next(error);
  }
};

const review = async (req, res, next) => {
  try {
    const { status, review_notes } = req.body;
    const result = await lostTicketService.review({
      requestId: req.params.id,
      status,
      reviewNotes: review_notes,
      reviewedBy: req.user.id,
      branchId: req.user.branch_id,
      ipAddress: req.ip,
    });
    return sendSuccess(
      res,
      result,
      `Request berhasil ${status === "approved" ? "disetujui" : "ditolak"}`,
    );
  } catch (error) {
    next(error);
  }
};

module.exports = { createRequest, getAll, review };
