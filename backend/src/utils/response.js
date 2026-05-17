// src/utils/response.js
// Format response API yang konsisten di seluruh sistem
// Semua response harus melewati helper ini supaya formatnya seragam

const sendSuccess = (
  res,
  data = null,
  message = "Success",
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

const sendError = (
  res,
  message = "Internal Server Error",
  statusCode = 500,
  errors = null,
) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  // Tambahkan detail error hanya di development
  if (errors && process.env.NODE_ENV === "development") {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

const sendPaginated = (res, data, pagination, message = "Success") => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      total_pages: Math.ceil(pagination.total / pagination.limit),
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = { sendSuccess, sendError, sendPaginated };
