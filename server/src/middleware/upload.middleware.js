const multer = require("multer");
const path = require("path");

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// File filter — support images for photos, and images/PDFs for licenses
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp/;
  const allowedDocTypes = /pdf|jpeg|jpg|png|webp/;
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (file.fieldname === "license") {
    const isDocAllowed = allowedDocTypes.test(ext) || allowedDocTypes.test(file.mimetype);
    if (isDocAllowed) {
      cb(null, true);
    } else {
      cb(new Error("Only document or image files are allowed for license (pdf, jpeg, jpg, png)"), false);
    }
  } else {
    const isImageAllowed = allowedImageTypes.test(ext) || allowedImageTypes.test(file.mimetype);
    if (isImageAllowed) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)"), false);
    }
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB max per file
});

// Single image upload (e.g. profile image)
exports.uploadSingle = upload.single("image");

// Multiple images upload (venue images — max 10)
exports.uploadMultiple = upload.array("images", 10);

// Venue upload with optional license document
exports.uploadVenueFiles = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "license", maxCount: 1 }
]);