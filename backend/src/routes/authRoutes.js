// src/routes/authRoutes.js
// Definisi endpoint untuk autentikasi

const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

// Middleware validasi input login
const loginValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username wajib diisi")
    .isLength({ min: 3 })
    .withMessage("Username minimal 3 karakter"),
  body("password")
    .notEmpty()
    .withMessage("Password wajib diisi")
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter"),
];

// POST /api/auth/login
router.post("/login", loginValidation, authController.login);

// GET /api/auth/profile  (butuh token)
router.get("/profile", authenticate, authController.getProfile);

// POST /api/auth/logout  (butuh token)
router.post("/logout", authenticate, authController.logout);

module.exports = router;
