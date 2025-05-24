const Product = require("../models/product");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

exports.addProduct = async (req, res) => {
  const { name, description, price, sku, stock } = req.body;
  try {
    const product = new Product({ name, description, price, sku, stock });
    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    res
      .status(400)
      .json({ error: "Error adding product", details: err.message });
  }
};
