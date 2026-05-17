const authService = require("../services/authService");
const { sendSuccess } = require("../utils/response");

const authController = {
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const result = await authService.login({
        username,
        password,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return sendSuccess(res, result, "Login berhasil");
    } catch (error) {
      next(error);
    }
  },

  getProfile: async (req, res, next) => {
    try {
      const user = await authService.getProfile(req.user.id);
      return sendSuccess(res, user, "Profil berhasil diambil");
    } catch (error) {
      next(error);
    }
  },

  logout: async (req, res, next) => {
    try {
      return sendSuccess(res, null, "Logout berhasil");
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
