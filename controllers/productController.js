const Product = require("../models/product");
const fs = require('fs');
const path = require('path');

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
  console.log(req.file);
  const imageUrl = req.file ? req.file.path : null;
  
  try {
    const product = new Product({ name, description, price, sku, stock, image_url: imageUrl});
    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    if(imageUrl) {
      fs.unlink(imageUrl, (err) => {
          if (err) console.error('Error deleting uploaded file during validation:', err);
      });
  }
    res
      .status(400)
      .json({ error: "Error adding product", details: err.message });
  }
};
