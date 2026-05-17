// src/services/authService.js
// Business logic untuk autentikasi
// Di sini tempatnya logika: cek password, generate token, dll

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const auditRepository = require("../repositories/auditRepository");
const { AppError } = require("../middlewares/errorHandler");
const { AUDIT_ACTIONS } = require("../config/constants");

const authService = {
  // Proses login
  login: async ({ username, password, ipAddress, userAgent }) => {
    // 1. Cari user di database
    const user = await userRepository.findByUsername(username);

    // Pesan error dibuat sama untuk keduanya (user tidak ada / password salah)
    // Supaya hacker tidak bisa tebak mana yang benar
    if (!user) {
      throw new AppError("Username atau password salah", 401);
    }

    // 2. Cek apakah user aktif
    if (!user.is_active) {
      throw new AppError("Akun tidak aktif, hubungi administrator", 403);
    }

    // 3. Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      // Catat percobaan login gagal
      await auditRepository.log({
        userId: user.id,
        action: "LOGIN_FAILED",
        ipAddress,
        userAgent,
        metadata: { reason: "wrong_password", username },
      });
      throw new AppError("Username atau password salah", 401);
    }

    // 4. Generate JWT token
    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      branch_id: user.branch_id,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "8h",
    });

    // 5. Update last login
    await userRepository.updateLastLogin(user.id);

    // 6. Catat login berhasil di audit log
    await auditRepository.log({
      userId: user.id,
      action: AUDIT_ACTIONS.LOGIN,
      ipAddress,
      userAgent,
      metadata: { username },
    });

    // 7. Return data (JANGAN kembalikan password_hash)
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        branch_id: user.branch_id,
        branch_name: user.branch_name,
      },
    };
  },

  // Ambil profil user yang sedang login
  getProfile: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User tidak ditemukan", 404);
    }
    return user;
  },
};

module.exports = authService;
