const Cart = require('../models/cart');

const getCartTotalPrice = async (items) => {
    return items.reduce((total, item) => {
        const itemPrice = item.item.price * (item.quantity || 1);
        return total + itemPrice;
    }, 0);
}


const getCartItems = async (user_id) => {
  try {
    const cart = await Cart.find({ user: user_id }).populate('item');
    if (!cart) {
      return [];
    }
    return cart.map(cartItem => ({
      item: cartItem.item,
      quantity: cartItem.quantity
    }));
  } catch (err) {
    console.error("Error retrieving cart items:", err);
    throw new Error("Failed to retrieve cart items");
  }
}

const clearCart = async (user_id) => {
  try {
    await Cart.deleteMany({ user: user_id });
    return { success: true, message: "Cart cleared successfully" };
  } catch (err) {
    console.error("Error clearing cart:", err);
    throw new Error("Failed to clear cart");
  }
}

module.exports = {
  getCartTotalPrice,
  getCartItems,
  clearCart
};