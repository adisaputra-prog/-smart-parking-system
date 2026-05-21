const express = require("express");
const { body } = require("express-validator");
const lostTicketController = require("../controllers/lostTicketController");
const { authenticate, authorize } = require("../middlewares/auth");

const router = express.Router();
router.use(authenticate);

// Operator & cashier buat request
router.post(
  "/",
  authorize("superadmin", "admin", "operator", "cashier"),
  [
    body("plate_number")
      .trim()
      .notEmpty()
      .withMessage("Plat nomor wajib diisi"),
    body("vehicle_type")
      .isIn(["motor", "mobil", "truk"])
      .withMessage("Jenis kendaraan tidak valid"),
    body("reason").trim().notEmpty().withMessage("Alasan wajib diisi"),
  ],
  lostTicketController.createRequest,
);

// Semua role bisa lihat list
router.get(
  "/",
  authorize("superadmin", "admin", "supervisor", "operator", "cashier"),
  lostTicketController.getAll,
);

// Hanya supervisor & superadmin yang bisa review
router.patch(
  "/:id/review",
  authorize("superadmin", "admin", "supervisor"),
  [
    body("status")
      .isIn(["approved", "rejected"])
      .withMessage("Status tidak valid"),
  ],
  lostTicketController.review,
);

module.exports = router;
