// src/config/constants.js
// Semua nilai tetap sistem dikumpulkan di sini
// Supaya mudah diubah tanpa harus cari-cari di banyak file

const CONSTANTS = {
  // Role pengguna sistem
  ROLES: {
    SUPERADMIN: "superadmin", // akses penuh semua cabang
    ADMIN: "admin", // akses penuh satu cabang
    OPERATOR: "operator", // input kendaraan masuk/keluar
    CASHIER: "cashier", // lihat laporan & proses pembayaran
  },

  // Status tiket parkir
  TICKET_STATUS: {
    ACTIVE: "active", // kendaraan masih di dalam
    COMPLETED: "completed", // sudah keluar & bayar
    LOST: "lost", // tiket hilang
    VOIDED: "voided", // dibatalkan oleh admin
  },

  // Jenis kendaraan
  VEHICLE_TYPES: {
    MOTOR: "motor",
    MOBIL: "mobil",
    TRUK: "truk",
  },

  // Arah gate
  GATE_DIRECTION: {
    ENTRY: "entry",
    EXIT: "exit",
    BOTH: "both",
  },

  // Aksi untuk audit log
  AUDIT_ACTIONS: {
    LOGIN: "LOGIN",
    LOGOUT: "LOGOUT",
    VEHICLE_ENTRY: "VEHICLE_ENTRY",
    VEHICLE_EXIT: "VEHICLE_EXIT",
    TICKET_VOID: "TICKET_VOID",
    USER_CREATE: "USER_CREATE",
    USER_UPDATE: "USER_UPDATE",
    USER_DELETE: "USER_DELETE",
    GATE_OPEN: "GATE_OPEN",
    GATE_CLOSE: "GATE_CLOSE",
  },

  // Format kode tiket: PKR-20240101-XXXX
  TICKET_PREFIX: "PKR",

  // Batas maksimum parkir sebelum dianggap hilang (24 jam)
  MAX_PARKING_HOURS: 24,
};

module.exports = CONSTANTS;
