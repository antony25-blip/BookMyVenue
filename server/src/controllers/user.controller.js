const User = require("../models/User");
const Booking = require("../models/Booking");
const Wishlist = require("../models/Wishlist");

// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, profileImage } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, address, profileImage },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ success: true, message: "Profile updated", user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/user/bookings
// @access  Private (user)
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("venue", "name location images pricePerHour category")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("Get bookings error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/user/wishlist
// @access  Private (user)
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user.id })
      .populate("venue", "name location images pricePerHour category capacity");

    res.json({ success: true, count: wishlist.length, wishlist });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   POST /api/user/wishlist/:venueId
// @access  Private (user)
exports.addToWishlist = async (req, res) => {
  try {
    const { venueId } = req.params;

    const existing = await Wishlist.findOne({ user: req.user.id, venue: venueId });
    if (existing) {
      return res.status(400).json({ success: false, message: "Venue already in wishlist" });
    }

    const wishlistItem = await Wishlist.create({ user: req.user.id, venue: venueId });
    res.status(201).json({ success: true, message: "Added to wishlist", wishlistItem });
  } catch (error) {
    console.error("Add wishlist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   DELETE /api/user/wishlist/:venueId
// @access  Private (user)
exports.removeFromWishlist = async (req, res) => {
  try {
    const { venueId } = req.params;

    const item = await Wishlist.findOneAndDelete({ user: req.user.id, venue: venueId });
    if (!item) {
      return res.status(404).json({ success: false, message: "Venue not in wishlist" });
    }

    res.json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    console.error("Remove wishlist error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};