// src/middlewares/auth.js
// Verifikasi JWT token di setiap request yang butuh autentikasi
// Juga mengatur Role Based Access Control (RBAC)

const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/response");
const { ROLES } = require("../config/constants");

// Middleware: cek apakah request punya JWT token yang valid
const authenticate = (req, res, next) => {
  try {
    // Token dikirim di header: Authorization: Bearer <token>
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "Token autentikasi tidak ditemukan", 401);
    }

    const token = authHeader.split(" ")[1];

    // Verifikasi token dengan secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Simpan data user di request supaya bisa diakses controller
    req.user = decoded;

    next();
  } catch (error) {
    next(error); // lempar ke errorHandler
  }
};

// Middleware: cek apakah user punya role yang diizinkan
// Penggunaan: authorize('admin', 'superadmin')
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Tidak terautentikasi", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, "Akses ditolak, role tidak memiliki izin", 403);
    }

    next();
  };
};

module.exports = { authenticate, authorize };
