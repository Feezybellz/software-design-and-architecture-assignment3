const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// POST /api/orders
router.post("/create", orderController.createOrder);

// GET /api/orders
router.get("/order", orderController.getOrders);

module.exports = router;
