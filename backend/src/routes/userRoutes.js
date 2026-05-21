const express = require("express");
const { body } = require("express-validator");
const userController = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/auth");

const router = express.Router();

router.use(authenticate);

const createValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username wajib diisi")
    .isLength({ min: 3, max: 50 })
    .withMessage("Username 3-50 karakter")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username hanya huruf, angka, underscore"),
  body("password")
    .notEmpty()
    .withMessage("Password wajib diisi")
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter"),
  body("full_name").trim().notEmpty().withMessage("Nama lengkap wajib diisi"),
  body("role")
    .notEmpty()
    .withMessage("Role wajib diisi")
    .isIn([
      "admin",
      "operator",
      "supervisor",
      "teknisi",
      "cashier",
      "superadmin",
    ])
    .withMessage("Role tidak valid"),
];

router.get("/", authorize("superadmin", "admin"), userController.getAll);
router.post(
  "/",
  authorize("superadmin", "admin"),
  createValidation,
  userController.create,
);
router.put("/:id", authorize("superadmin", "admin"), userController.update);
router.delete(
  "/:id",
  authorize("superadmin", "admin"),
  userController.deactivate,
);

module.exports = router;
