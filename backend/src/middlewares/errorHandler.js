// src/middlewares/errorHandler.js
// Menangkap semua error yang terjadi di seluruh aplikasi
// Satu tempat untuk handle semua error = lebih mudah di-maintain

const logger = require("../config/logger");
const { sendError } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  // Log error untuk keperluan debugging
  logger.error(`${err.message} | URL: ${req.originalUrl} | IP: ${req.ip}`);

  // Error dari JWT (token tidak valid)
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Token tidak valid", 401);
  }

  // Error dari JWT (token expired)
  if (err.name === "TokenExpiredError") {
    return sendError(res, "Token sudah expired, silakan login ulang", 401);
  }

  // Error dari PostgreSQL
  if (err.code === "23505") {
    return sendError(res, "Data sudah ada, tidak boleh duplikat", 409);
  }

  if (err.code === "23503") {
    return sendError(res, "Data referensi tidak ditemukan", 400);
  }

  // Error validasi dari express-validator
  if (err.type === "validation") {
    return sendError(res, "Validasi gagal", 422, err.errors);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Terjadi kesalahan pada server";

  return sendError(res, message, statusCode);
};

// Custom error class supaya bisa set statusCode
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}

module.exports = { errorHandler, AppError };
