const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const Product = require("../models/product");
const cartController = require("../controllers/cartControllers");

// Initialize cart in session if not present
function initCart(req) {
  if (!req.session.cart) {
    req.session.cart = [];
  }
}

// GET /api/cart - View cart
router.get("/", (req, res) => {
  initCart(req);
  res.json(req.session.cart);
});

router.post("/add", authenticate, cartController.addToCart);

router.get("/get", authenticate, cartController.getCart);

// POST /api/cart/add - Add to cart
// router.post("/add", async (req, res) => {
//   initCart(req);
//   const { productId, quantity } = req.body;
//   try {
//     const product = await Product.findById(productId);
//     if (!product) return res.status(404).json({ error: "Product not found" });

//     const existing = req.session.cart.find(
//       (item) => item.productId === productId
//     );
//     if (existing) {
//       existing.quantity += parseInt(quantity);
//     } else {
//       req.session.cart.push({
//         productId,
//         name: product.name,
//         price: product.price,
//         quantity,
//       });
//     }

//     res.json({ message: "Product added to cart", cart: req.session.cart });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to add to cart" });
//   }
// });

// POST /api/cart/remove - Remove from cart
router.post("/remove", (req, res) => {
  initCart(req);
  const { productId } = req.body;
  req.session.cart = req.session.cart.filter(
    (item) => item.productId !== productId
  );
  res.json({ message: "Item removed", cart: req.session.cart });
});

// POST /api/cart/clear - Clear cart
router.post("/clear", (req, res) => {
  req.session.cart = [];
  res.json({ message: "Cart cleared" });
});

module.exports = router;
