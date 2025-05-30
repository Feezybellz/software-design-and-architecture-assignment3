const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authorizeAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// POST /api/products - Add a new product
router.post('/', authorizeAdmin, upload.single('product_image'), productController.addProduct);

// PUT /api/products/:productId - Edit an existing product
router.put('/:productId', authorizeAdmin, upload.single('product_image'), productController.editProduct);

// GET /api/products - Get all products (public)
router.get('/', authorizeAdmin, productController.getAllProducts);

router.get('/:productId', authorizeAdmin, productController.getProduct);

router.delete('/:productId', authorizeAdmin, productController.deleteProduct);

module.exports = router;
