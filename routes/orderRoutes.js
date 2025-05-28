const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/authMiddleware');

// POST /api/orders - Create a new order
router.post('/', authenticate, orderController.createOrder);

// GET /api/orders - Get all orders for the logged-in user
router.get('/', authenticate, orderController.getOrders);

// GET /api/orders/:orderId - Get a specific order
router.get('/:orderId', authenticate, orderController.getOrder);

module.exports = router;
