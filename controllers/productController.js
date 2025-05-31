const Product = require("../models/product");
const fs = require("fs");
const path = require("path");

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
  const imageUrl = req.file_path ? req.file_path : null;

  try {
    const product = new Product({
      name,
      description,
      price,
      sku,
      stock,
      image_url: imageUrl,
    });
    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    if (imageUrl) {
      fs.unlink(imageUrl, (err) => {
        if (err)
          console.error("Error deleting uploaded file during validation:", err);
      });
    }
    res
      .status(400)
      .json({ error: "Error adding product", details: err.message });
  }
};

exports.editProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const updateData = req.body;

    let product = await Product.findById(productId);
    if (!product) {
      // If a new file was uploaded during a failed product lookup, delete it.
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err)
            console.error(
              "Error deleting uploaded file for non-existent product:",
              err
            );
        });
      }
      return res.status(404).json({ error: "Product not found" });
    }

    const oldImagePath = product.image_url;

    // Update text fields
    // Iterate over updateData and update product fields
    for (const key in updateData) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        // Ensure not to overwrite special Mongoose fields or unintended properties
        if (key in product.schema.paths || key === "_id") {
          // Do not allow _id to be updated this way.
          if (key !== "_id") product[key] = updateData[key];
        } else {
          // Potentially log or handle keys not in schema if strict schema is not used
          // For now, we assume schema is defined and keys in updateData should match schema fields
          product[key] = updateData[key];
        }
      }
    }

    // Handle image update
    if (req.file) {
      product.image_url = req.file_path ? req.file_path : null;
      // If there was an old image, and it's different from the new one
      if (oldImagePath && oldImagePath !== product.image_url) {
        fs.unlink(oldImagePath, (err) => {
          if (err) console.error("Error deleting old product image:", err);
        });
      }
    }

    const updatedProduct = await product.save();
    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    // If an error occurs during product.save() and a new file was uploaded, delete it.
    if (req.file && err.name !== "CastError") {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr)
          console.error(
            "Error deleting uploaded file during update error:",
            unlinkErr
          );
      });
    }
    if (err.name === "CastError") {
      return res
        .status(400)
        .json({ error: "Invalid product ID format", details: err.message });
    }
    // Check for unique constraint error (e.g., for SKU)
    // Safely access product.sku only if product is defined (it should be at this point unless findById failed earlier)
    const skuForError =
      product && product.sku ? product.sku : updateData.sku || "unknown";
    if (err.code === 11000) {
      return res.status(400).json({
        error: "Validation failed",
        details: `SKU '${skuForError}' already exists.`,
      });
    }
    res
      .status(500)
      .json({ error: "Failed to update product", details: err.message });
  }
};

exports.getProduct = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete product", details: err.message });
  }
};

exports.reduceStock = async (productId, quantity) => {
  try {
    const result = await Product.findOneAndUpdate(
      {
        _id: productId,
        stock: { $gte: quantity },
      },
      {
        $inc: { stock: -quantity },
      },
      {
        new: true,
      }
    );

    if (!result) {
      throw new Error("Insufficient stock");
    }

    return result;
  } catch (err) {
    throw err;
  }
};
