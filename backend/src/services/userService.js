const bcrypt = require("bcryptjs");
const userRepository = require("../repositories/userRepository");
const auditRepository = require("../repositories/auditRepository");
const { AppError } = require("../middlewares/errorHandler");

const VALID_ROLES = [
  "superadmin",
  "admin",
  "operator",
  "supervisor",
  "teknisi",
  "cashier",
];

const userService = {
  getAll: async (requestingUser) => {
    const branchId =
      requestingUser.role === "superadmin" ? null : requestingUser.branch_id;
    return await userRepository.findAll(branchId);
  },

  create: async (userData, requestingUser, ipAddress) => {
    if (!VALID_ROLES.includes(userData.role)) {
      throw new AppError(
        `Role tidak valid. Pilih: ${VALID_ROLES.join(", ")}`,
        400,
      );
    }
    if (
      userData.role === "superadmin" &&
      requestingUser.role !== "superadmin"
    ) {
      throw new AppError("Tidak bisa membuat akun superadmin", 403);
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(userData.password, rounds);

    const newUser = await userRepository.create({
      branch_id: userData.branch_id || requestingUser.branch_id,
      username: userData.username.toLowerCase().trim(),
      email: userData.email || null,
      password_hash: passwordHash,
      full_name: userData.full_name,
      role: userData.role,
    });

    await auditRepository.log({
      userId: requestingUser.id,
      action: "USER_CREATE",
      entityType: "user",
      entityId: newUser.id,
      ipAddress,
      newValues: { username: newUser.username, role: newUser.role },
    });

    return newUser;
  },

  update: async (userId, userData, requestingUser, ipAddress) => {
    const existing = await userRepository.findById(userId);
    if (!existing) throw new AppError("User tidak ditemukan", 404);

    if (userData.role && !VALID_ROLES.includes(userData.role)) {
      throw new AppError("Role tidak valid", 400);
    }

    if (userData.password && userData.password.trim() !== "") {
      const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      userData.password_hash = await bcrypt.hash(userData.password, rounds);
    }
    delete userData.password;

    const updated = await userRepository.update(userId, userData);

    await auditRepository.log({
      userId: requestingUser.id,
      action: "USER_UPDATE",
      entityType: "user",
      entityId: userId,
      ipAddress,
      oldValues: { role: existing.role },
      newValues: userData,
    });

    return updated;
  },

  deactivate: async (userId, requestingUser, ipAddress) => {
    if (userId === requestingUser.id) {
      throw new AppError("Tidak bisa menonaktifkan akun sendiri", 400);
    }
    const result = await userRepository.deactivate(userId);
    if (!result) throw new AppError("User tidak ditemukan", 404);

    await auditRepository.log({
      userId: requestingUser.id,
      action: "USER_DELETE",
      entityType: "user",
      entityId: userId,
      ipAddress,
    });

    return result;
  },
};

module.exports = userService;
