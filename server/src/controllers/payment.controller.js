const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const crypto = require("crypto");

// @route   POST /api/payments
// @access  Private (user)
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod } = req.body;

    if (!bookingId || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Booking ID and payment method are required" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Cannot pay for a cancelled booking" });
    }

    // Check if payment already exists for this booking
    const existingPayment = await Payment.findOne({ booking: bookingId, paymentStatus: "success" });
    if (existingPayment) {
      return res.status(400).json({ success: false, message: "Payment already completed for this booking" });
    }

    // Generate a mock transaction ID (replace with real payment gateway in production)
    const transactionId = "TXN-" + crypto.randomBytes(8).toString("hex").toUpperCase();

    const payment = await Payment.create({
      booking: bookingId,
      user: req.user.id,
      amount: booking.totalAmount,
      paymentMethod,
      transactionId,
      paymentStatus: "success", // Simulated success — integrate Razorpay/Stripe here
    });

    // Update booking status to confirmed after payment
    booking.status = "confirmed";
    await booking.save();

    res.status(201).json({
      success: true,
      message: "Payment successful",
      payment,
    });
  } catch (error) {
    console.error("Payment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/payments/:id
// @access  Private
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("booking")
      .populate("user", "name email");

    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

    if (payment.user._id.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, payment });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/payments/my-payments
// @access  Private (user)
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate({ path: "booking", populate: { path: "venue", select: "name location" } })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    console.error("Get my payments error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};