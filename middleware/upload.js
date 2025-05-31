const multer = require("multer");
const path = require("path"); // Node.js built-in module

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/products/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename =
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);

    req.file_path = "/uploads/products/" + filename;

    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    // Accept the file
    cb(null, true);
  } else {
    // Reject the file
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

module.exports = upload;
