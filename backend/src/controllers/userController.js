const userService = require("../services/userService");
const { sendSuccess } = require("../utils/response");

const getAll = async (req, res, next) => {
  try {
    const users = await userService.getAll(req.user);
    return sendSuccess(res, users, "Data user berhasil diambil");
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const user = await userService.create(req.body, req.user, req.ip);
    return sendSuccess(res, user, "User berhasil dibuat", 201);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const user = await userService.update(
      req.params.id,
      req.body,
      req.user,
      req.ip,
    );
    return sendSuccess(res, user, "User berhasil diupdate");
  } catch (error) {
    next(error);
  }
};

const deactivate = async (req, res, next) => {
  try {
    const result = await userService.deactivate(
      req.params.id,
      req.user,
      req.ip,
    );
    return sendSuccess(res, result, "User berhasil dinonaktifkan");
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, create, update, deactivate };
