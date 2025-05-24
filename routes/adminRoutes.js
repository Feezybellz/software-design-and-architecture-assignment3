const express = require("express");
const adminAPIRouter = express.Router();
const adminViewRouter = express.Router();
const adminController = require("../controllers/adminController");
const {
  verifyAdmin,
  verifyAdminCookies,
} = require("../middleware/authMiddleware");

adminAPIRouter.get("/orders", verifyAdmin, adminController.getAllOrders);
adminAPIRouter.get("/report", verifyAdmin, adminController.getSalesReport);

adminViewRouter.get("/", verifyAdminCookies, (req, res) => {
  res.sendFile("admin.html", { root: "./views" });
});

exports.adminRoutes = adminAPIRouter;
exports.adminViewRoutes = adminViewRouter;
