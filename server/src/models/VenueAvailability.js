const mongoose = require("mongoose");

const venueAvailabilitySchema = new mongoose.Schema(
  {
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    bookedSlots: [
      {
        startTime: String,
        endTime: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// One availability record per venue per date
venueAvailabilitySchema.index(
  { venue: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "VenueAvailability",
  venueAvailabilitySchema
);