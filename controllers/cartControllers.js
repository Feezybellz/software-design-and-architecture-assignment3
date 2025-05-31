const Cart = require("../models/cart");
const Product = require("../models/product");

exports.addToCart = async (req, res) => {
    try {
        const { item, quantity } = req.body;
        const user = req.user.id;

        // Check if product exists and has sufficient stock
        const product = await Product.findById(item);
        if (!product) {
            return res.status(404).json({ 
                status: "error", 
                message: "Product not found" 
            });
        }

        // Check if requested quantity is available
        if (product.stock < quantity) {
            return res.status(400).json({ 
                status: "error", 
                message: `Only ${product.stock} items available in stock` 
            });
        }

        // Check if item already exists in cart
        const existingCartItem = await Cart.findOne({ item, user });
        if (existingCartItem) {
            // Check if adding the new quantity would exceed stock
            const newQuantity = existingCartItem.quantity + quantity;
            if (product.stock < newQuantity) {
                return res.status(400).json({ 
                    status: "error", 
                    message: `Cannot add ${quantity} more items. Only ${product.stock - existingCartItem.quantity} additional items available in stock` 
                });
            }
            // Update existing cart item
            existingCartItem.quantity = newQuantity;
            await existingCartItem.save();
            return res.status(200).json({ 
                status: "success", 
                message: "Cart updated successfully" 
            });
        }

        // Create new cart item
        const cartItem = new Cart({ item, quantity, user });
        await cartItem.save();
        res.status(201).json({ 
            status: "success", 
            message: "Item added to cart successfully" 
        });
    } catch (err) {
        res.status(500).json({ status: "error", error: err.message });
    }
}

exports.getCart = async (req, res) => {
    try {
        const user = req.user.id;
        const cartItems = await Cart.find({ user }).populate("item");
        res.status(200).json({ status: "success", data: cartItems });
    } catch (err) {
        res.status(500).json({ status: "error", error: err.message });
    }
}