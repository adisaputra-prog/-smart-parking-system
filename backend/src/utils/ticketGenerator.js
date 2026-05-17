// src/utils/ticketGenerator.js
// Generate kode tiket unik dan QR code
// Format tiket: PKR-20240101-ABCD

const QRCode = require("qrcode");
const crypto = require("crypto");
const dayjs = require("dayjs");

// Generate kode tiket yang mudah dibaca manusia
// Format: PKR-YYYYMMDD-XXXX (X = random alphanumeric)
const generateTicketCode = () => {
  const date = dayjs().format("YYYYMMDD");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PKR-${date}-${random}`;
};

// Generate hash unik untuk QR code
// Hash ini yang disimpan di database dan di-encode ke QR
// Menggunakan crypto supaya tidak bisa dipalsukan
const generateQRHash = (ticketCode, plateNumber, entryTime) => {
  const data = `${ticketCode}-${plateNumber}-${entryTime}-${process.env.JWT_SECRET}`;
  return crypto.createHash("sha256").update(data).digest("hex");
};

// Generate QR code sebagai base64 image
// Base64 bisa langsung ditampilkan di browser tanpa simpan file
const generateQRCode = async (qrHash) => {
  try {
    const qrDataURL = await QRCode.toDataURL(qrHash, {
      errorCorrectionLevel: "H", // High = tahan rusak sampai 30%
      type: "image/png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return qrDataURL;
  } catch (error) {
    throw new Error("Gagal generate QR Code: " + error.message);
  }
};

module.exports = { generateTicketCode, generateQRHash, generateQRCode };
