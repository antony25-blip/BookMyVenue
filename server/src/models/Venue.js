const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  capacity: {
    type: Number,
    required: true,
  },
  category: {
      type: String,
      enum: [
        "Birthday Hall",
        "Cafe",
        "Hotel",
        "Resort",
        "Auditorium",
        "Meetup Space",
      ],
      required: true,
  },
  pricePerHour: {
    type: Number,
    required: true,
  },
  pricePerDay: {
    type: Number,
    default: 0, // 0 means not available for daily booking
  },
  openTime: {
    type: String,
    default: "08:00", // e.g. "08:00"
  },
  closeTime: {
    type: String,
    default: "22:00", // e.g. "22:00"
  },
  gapHours: {
    type: Number,
    default: 4, // Cleanup buffer between bookings (hours)
  },
  setupHours: {
    type: Number,
    default: 2, // Stage setup buffer before bookings (hours)
  },
  
  amenities: [String],
  images: [String],
  isApproved: {
      type: Boolean,
      default: false,
    },
  license: {
    type: String,
    default: "",
  },
},
{ timestamps: true }
);

module.exports = mongoose.model('Venue', venueSchema);