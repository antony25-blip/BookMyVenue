const User = require("../models/User");
const Venue = require("../models/Venue");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

// @route   GET /api/admin/dashboard
// @access  Private (admin)
exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalVenues, totalBookings, totalPayments] = await Promise.all([
      User.countDocuments(),
      Venue.countDocuments(),
      Booking.countDocuments(),
      Payment.countDocuments({ paymentStatus: "success" }),
    ]);

    const revenue = await Payment.aggregate([
      { $match: { paymentStatus: "success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const bookingStats = await Booking.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      dashboard: {
        totalUsers,
        totalVenues,
        totalBookings,
        totalPayments,
        totalRevenue: revenue[0]?.total || 0,
        bookingStats,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/admin/users
// @access  Private (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await user.deleteOne();
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/admin/venues
// @access  Private (admin)
exports.getAllVenues = async (req, res) => {
  try {
    const venues = await Venue.find()
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: venues.length, venues });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/admin/venues/:id/approve
// @access  Private (admin)
exports.approveVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });
    res.json({ success: true, message: "Venue approved", venue });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/admin/venues/:id/reject
// @access  Private (admin)
exports.rejectVenue = async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    );
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });
    res.json({ success: true, message: "Venue rejected", venue });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   DELETE /api/admin/venues/:id
// @access  Private (admin)
exports.deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });

    await venue.deleteOne();
    res.json({ success: true, message: "Venue deleted by admin" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/admin/bookings
// @access  Private (admin)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("user", "name email phone")
      .populate("venue", "name location")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/admin/payments
// @access  Private (admin)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate({ path: "booking", populate: { path: "venue", select: "name location" } })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};