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
  amenities: [String],
  images: [String],
  isApproved: {
      type: Boolean,
      default: false,
    },
},
{ timestamps: true }
);

module.exports = mongoose.model('Venue', venueSchema);