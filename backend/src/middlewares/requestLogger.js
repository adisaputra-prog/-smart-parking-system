// src/middlewares/requestLogger.js
// Mencatat setiap HTTP request yang masuk ke server
// Berguna untuk debugging dan monitoring

const logger = require("../config/logger");

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Setelah response dikirim, catat hasilnya
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms | IP: ${req.ip}`;

    // Warnai log berbeda berdasarkan status code
    if (res.statusCode >= 500) {
      logger.error(logMessage);
    } else if (res.statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }
  });

  next();
};

module.exports = requestLogger;
