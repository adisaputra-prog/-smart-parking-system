const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

const loginValidation = [
  body("username").trim().notEmpty().withMessage("Username wajib diisi"),
  body("password").notEmpty().withMessage("Password wajib diisi"),
];

router.post("/login", loginValidation, authController.login);
router.get("/profile", authenticate, authController.getProfile);
router.post("/logout", authenticate, authController.logout);

module.exports = router;
