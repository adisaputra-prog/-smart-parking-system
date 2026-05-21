// src/routes/parkingRoutes.js

const express = require("express");
const { body, param } = require("express-validator");
const parkingController = require("../controllers/parkingController");
const { authenticate, authorize } = require("../middlewares/auth");

const router = express.Router();

// Semua route parkir butuh login
router.use(authenticate);

// Validasi input kendaraan masuk
const entryValidation = [
  body("plate_number")
    .trim()
    .notEmpty()
    .withMessage("Plat nomor wajib diisi")
    .isLength({ min: 4, max: 15 })
    .withMessage("Plat nomor tidak valid")
    .matches(/^[A-Za-z0-9\s]+$/)
    .withMessage("Plat nomor hanya boleh huruf dan angka"),
  body("vehicle_type")
    .notEmpty()
    .withMessage("Jenis kendaraan wajib diisi")
    .isIn(["motor", "mobil", "truk"])
    .withMessage("Jenis kendaraan tidak valid"),
];

// Validasi input kendaraan keluar
const exitValidation = [
  body("qr_hash")
    .notEmpty()
    .withMessage("QR hash wajib diisi")
    .isLength({ min: 64, max: 64 })
    .withMessage("QR hash tidak valid"),
];

// POST /api/parking/entry — kendaraan masuk
router.post(
  "/entry",
  entryValidation,
  authorize("superadmin", "admin", "operator"),
  parkingController.vehicleEntry,
);

// POST /api/parking/exit — kendaraan keluar
router.post(
  "/exit",
  exitValidation,
  authorize("superadmin", "admin", "operator"),
  parkingController.vehicleExit,
);

// GET /api/parking/active — daftar kendaraan aktif
router.get(
  "/active",
  authorize("superadmin", "admin", "operator", "cashier"),
  parkingController.getActiveVehicles,
);

// GET /api/parking/stats — statistik hari ini
router.get(
  "/stats",
  authorize("superadmin", "admin", "operator", "cashier"),
  parkingController.getTodayStats,
);

// GET /api/parking/ticket/:ticketCode — cek tiket
router.get(
  "/ticket/:ticketCode",
  authorize("superadmin", "admin", "operator", "cashier"),
  parkingController.checkTicket,
);

// GET /api/parking/cashflow — statistik cashflow
router.get(
  "/cashflow",
  authorize("superadmin", "admin", "supervisor", "cashier"),
  parkingController.getCashflow,
);

module.exports = router;
