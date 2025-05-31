const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/forgot-password", authController.forgotPassword);
router.get("/login-status", authController.checkLoginStatus);

module.exports = router;
