const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  getMyBookings,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require("../controllers/user.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const { uploadSingle } = require("../middleware/upload.middleware");

// All routes require login
router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", uploadSingle, updateProfile);

// Bookings history
router.get("/bookings", authorizeRoles("user"), getMyBookings);

// Wishlist
router.get("/wishlist",          authorizeRoles("user"), getWishlist);
router.post("/wishlist/:venueId", authorizeRoles("user"), addToWishlist);
router.delete("/wishlist/:venueId", authorizeRoles("user"), removeFromWishlist);

module.exports = router;