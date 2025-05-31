const express = require("express");
const adminAPIRouter = express.Router();
const adminViewRouter = express.Router();
const adminController = require("../controllers/adminController");
const {
  authorizeAdmin,
} = require("../middleware/authMiddleware");

adminAPIRouter.get("/orders", authorizeAdmin, adminController.getAllOrders);
adminAPIRouter.get("/report", authorizeAdmin, adminController.getSalesReport);
adminAPIRouter.get("/statistics", authorizeAdmin, adminController.getOrderStatistics);
adminAPIRouter.patch("/orders/:orderId/status", authorizeAdmin, adminController.updateOrderStatus);

adminViewRouter.get("/", authorizeAdmin, (req, res) => {
  res.sendFile("admin.html", { root: "./views" });
});
adminViewRouter.get("/products", authorizeAdmin, (req, res) => {
  res.sendFile("admin-manage-products.html", { root: "./views" });
});
adminViewRouter.get("/orders", authorizeAdmin, (req, res) => {
  res.sendFile("admin-orders.html", { root: "./views" });
});
adminViewRouter.get("/statistics", authorizeAdmin, (req, res) => {
  res.sendFile("admin-statistics.html", { root: "./views" });
});
adminViewRouter.get("/orders/:orderId", authorizeAdmin, (req, res) => {
  res.sendFile("admin-view-order.html", { root: "./views" });
});

exports.adminRoutes = adminAPIRouter;
exports.adminViewRoutes = adminViewRouter;
