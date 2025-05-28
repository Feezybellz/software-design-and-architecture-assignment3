const Cart = require("../models/cart");
const cartController = require("../controllers/cartControllers");

exports.addToCart = async (req, res) => {
    try {
        const { item, quantity } = req.body;
        const user = req.user.id;

        const cartItem = new Cart({ item, quantity, user })
        await cartItem.save();
        res.status(201).json({ status: "success", message: "Item added to cart successfully" });
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