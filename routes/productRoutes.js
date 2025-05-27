const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const upload = require('../middleware/upload');

// GET /api/products
router.get("/", productController.getAllProducts);

// POST /api/products
router.post('/', upload.single('product_image'), productController.addProduct);

module.exports = router;
