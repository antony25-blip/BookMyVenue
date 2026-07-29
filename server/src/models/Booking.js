const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },

    bookingDate: {
      type: Date,
      required: true,
    },

    // For daily bookings, endDate is the last day (inclusive)
    endDate: {
      type: Date,
      default: null,
    },

    bookingType: {
      type: String,
      enum: ["hourly", "daily"],
      default: "hourly",
    },

    startTime: {
      type: String,
      default: null, // null for daily bookings
    },
    endTime: {
      type: String,
      default: null, // null for daily bookings
    },

    guests: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },

    cancellationReason: {
      type: String,
      default: null,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);