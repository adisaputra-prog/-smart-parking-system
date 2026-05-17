// src/config/logger.js
// Winston logger untuk mencatat semua aktivitas sistem
// Di production, log disimpan ke file. Di development, tampil di terminal

const winston = require("winston");
const path = require("path");

// Format log yang mudah dibaca
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return stack
      ? `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`
      : `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  }),
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "debug",
  format: logFormat,
  transports: [
    // Selalu tampil di terminal
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // warna di terminal
        logFormat,
      ),
    }),
    // Simpan semua log ke file
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/app.log"),
      maxsize: 5242880, // 5MB per file
      maxFiles: 5, // simpan maksimal 5 file log lama
    }),
    // File khusus untuk error saja
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;
