const Booking = require("../models/Booking");
const Venue = require("../models/Venue");
const VenueAvailability = require("../models/VenueAvailability");

// Helper: convert "HH:MM" time string to minutes from midnight
const timeToMins = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

// Helper: check if a new slot overlaps or falls within the gap buffer of existing booked slots
// gapMins = cleanup buffer in minutes after a booking ends
const isSlotConflicting = (bookedSlots, startTime, endTime, gapMins, setupMins = 0) => {
  const newStart = timeToMins(startTime);
  const newEnd = timeToMins(endTime);
  return bookedSlots.some((slot) => {
    const existStart = timeToMins(slot.startTime);
    const existEnd = timeToMins(slot.endTime);
    // Blocked zone around an existing booked slot is:
    // Setup buffer time before it starts, and cleanup buffer time after it ends.
    // Conflict if newStart < (existEnd + gapMins) AND newEnd > (existStart - setupMins)
    return newStart < (existEnd + gapMins) && newEnd > (existStart - setupMins);
  });
};

// Helper: generate UTC-midnight date objects between two dates (inclusive)
const datesBetween = (startDate, endDate) => {
  const dates = [];
  const current = new Date(startDate);
  current.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);
  while (current <= end) {
    dates.push(new Date(current));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
};

// @route   POST /api/bookings
// @access  Private (user)
exports.createBooking = async (req, res) => {
  try {
    const {
      venueId, bookingDate, endDate,
      startTime, endTime,
      guests, bookingType = "hourly"
    } = req.body;

    if (!venueId || !bookingDate || !guests) {
      return res.status(400).json({ success: false, message: "venueId, bookingDate, and guests are required" });
    }
    if (bookingType === "hourly" && (!startTime || !endTime)) {
      return res.status(400).json({ success: false, message: "startTime and endTime are required for hourly bookings" });
    }
    if (bookingType === "daily" && !endDate) {
      return res.status(400).json({ success: false, message: "endDate is required for daily bookings" });
    }

    // Check venue exists and is approved
    const venue = await Venue.findById(venueId);
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });
    if (!venue.isApproved) return res.status(400).json({ success: false, message: "Venue is not approved for booking" });

    // Check guest capacity
    if (Number(guests) > venue.capacity) {
      return res.status(400).json({ success: false, message: `Venue capacity is ${venue.capacity} guests` });
    }

    // --- HOURLY BOOKING ---
    if (bookingType === "hourly") {
      const startMins = timeToMins(startTime);
      const endMins = timeToMins(endTime);

      if (endMins <= startMins) {
        return res.status(400).json({ success: false, message: "End time must be after start time" });
      }

      if (venue.category === "Auditorium") {
        const hours = (endMins - startMins) / 60;
        if (hours > 6) {
          return res.status(400).json({ success: false, message: "Auditoriums can only be booked for a maximum of 6 hours." });
        }
      }

      // Validate against venue working hours
      const openMins = timeToMins(venue.openTime || "08:00");
      const closeMins = timeToMins(venue.closeTime || "22:00");
      if (startMins < openMins || endMins > closeMins) {
        return res.status(400).json({
          success: false,
          message: `Venue is only open from ${venue.openTime || "08:00"} to ${venue.closeTime || "22:00"}`
        });
      }

      const dateObj = new Date(bookingDate);
      dateObj.setUTCHours(0, 0, 0, 0);

      const gapMins = (venue.gapHours || 4) * 60;
      const setupMins = (venue.setupHours || 2) * 60;

      // Ensure availability document exists
      let availability = await VenueAvailability.findOne({ venue: venueId, date: dateObj });
      if (!availability) {
        try {
          availability = await VenueAvailability.create({ venue: venueId, date: dateObj, bookedSlots: [], isAvailable: true });
        } catch (err) {
          if (err.code === 11000) {
            availability = await VenueAvailability.findOne({ venue: venueId, date: dateObj });
          } else throw err;
        }
      }

      if (!availability.isAvailable) {
        return res.status(400).json({ success: false, message: "Venue is not available on this date" });
      }

      // Local early check (with gap/setup logic)
      if (isSlotConflicting(availability.bookedSlots, startTime, endTime, gapMins, setupMins)) {
        return res.status(400).json({ success: false, message: "Selected time slot conflicts with an existing booking (including setup buffer and cleanup gap)" });
      }

      const hours = (endMins - startMins) / 60;
      const totalAmount = hours * venue.pricePerHour;

      // Atomic slot reservation with gap check embedded in query
      const updatedAvailability = await VenueAvailability.findOneAndUpdate(
        {
          _id: availability._id,
          isAvailable: true,
          // No slot should conflict (we apply gap as a wider check server-side above)
          bookedSlots: {
            $not: {
              $elemMatch: {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime }
              }
            }
          }
        },
        { $push: { bookedSlots: { startTime, endTime } } },
        { new: true }
      );

      if (!updatedAvailability) {
        return res.status(400).json({ success: false, message: "Time slot already taken (concurrent booking conflict)" });
      }

      let booking;
      try {
        booking = await Booking.create({
          user: req.user.id,
          venue: venueId,
          bookingType: "hourly",
          bookingDate: dateObj,
          startTime,
          endTime,
          guests: Number(guests),
          totalAmount,
          status: "pending",
        });
      } catch (bookingErr) {
        // Rollback slot reservation on booking creation failure
        await VenueAvailability.updateOne(
          { _id: availability._id },
          { $pull: { bookedSlots: { startTime, endTime } } }
        );
        throw bookingErr;
      }

      await booking.populate("venue", "name location address images pricePerHour openTime closeTime gapHours setupHours");
      return res.status(201).json({ success: true, message: "Hourly booking created successfully", booking });
    }

    // --- DAILY BOOKING ---
    if (bookingType === "daily") {
      if (!venue.pricePerDay || venue.pricePerDay === 0) {
        return res.status(400).json({ success: false, message: "This venue does not offer daily booking" });
      }

      const startDateObj = new Date(bookingDate);
      startDateObj.setUTCHours(0, 0, 0, 0);
      const endDateObj = new Date(endDate);
      endDateObj.setUTCHours(0, 0, 0, 0);

      if (endDateObj < startDateObj) {
        return res.status(400).json({ success: false, message: "Check-out date must be after check-in date" });
      }

      const days = (endDateObj - startDateObj) / (1000 * 60 * 60 * 24) + 1;
      const totalAmount = days * venue.pricePerDay;

      // Check each date in the range is fully available (not marked unavailable)
      const allDates = datesBetween(startDateObj, endDateObj);
      for (const d of allDates) {
        const avail = await VenueAvailability.findOne({ venue: venueId, date: d });
        if (avail && (!avail.isAvailable || avail.bookedSlots.length > 0)) {
          return res.status(400).json({
            success: false,
            message: `Venue is already booked or unavailable on ${d.toISOString().split("T")[0]}`
          });
        }
      }

      // Mark all dates as fully booked (isAvailable: false)
      for (const d of allDates) {
        await VenueAvailability.findOneAndUpdate(
          { venue: venueId, date: d },
          { $set: { isAvailable: false, bookedSlots: [{ startTime: "00:00", endTime: "23:59" }] } },
          { upsert: true, new: true }
        );
      }

      const booking = await Booking.create({
        user: req.user.id,
        venue: venueId,
        bookingType: "daily",
        bookingDate: startDateObj,
        endDate: endDateObj,
        startTime: null,
        endTime: null,
        guests: Number(guests),
        totalAmount,
        status: "pending",
      });

      await booking.populate("venue", "name location address images pricePerHour pricePerDay openTime closeTime setupHours");
      return res.status(201).json({ success: true, message: `Daily booking created for ${days} day(s)`, booking });
    }

    return res.status(400).json({ success: false, message: "Invalid bookingType. Must be 'hourly' or 'daily'" });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("venue", "name location address images pricePerHour pricePerDay openTime closeTime setupHours")
      .populate("user", "name email phone address");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const isOwner = booking.user._id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/bookings/:id/cancel
// @access  Private (user — own booking only)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to cancel this booking" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    booking.cancellationReason = req.body.reason || "Cancelled by user";
    await booking.save();

    if (booking.bookingType === "hourly" && booking.startTime && booking.endTime) {
      // Free up the hourly slot
      await VenueAvailability.updateOne(
        { venue: booking.venue, date: booking.bookingDate },
        { $pull: { bookedSlots: { startTime: booking.startTime, endTime: booking.endTime } } }
      );
    } else if (booking.bookingType === "daily") {
      // Re-open all dates in the daily booking range
      const allDates = datesBetween(booking.bookingDate, booking.endDate || booking.bookingDate);
      for (const d of allDates) {
        await VenueAvailability.findOneAndUpdate(
          { venue: booking.venue, date: d },
          { $set: { isAvailable: true, bookedSlots: [] } }
        );
      }
    }

    res.json({ success: true, message: "Booking cancelled", booking });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/bookings/:id/confirm
// @access  Private (venue_owner)
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("venue");
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.venue.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to confirm this booking" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: `Booking is already ${booking.status}` });
    }

    booking.status = "confirmed";
    await booking.save();

    res.json({ success: true, message: "Booking confirmed", booking });
  } catch (error) {
    console.error("Confirm booking error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/bookings/venue/:venueId
// @access  Private (venue_owner)
exports.getVenueBookings = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.venueId);
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });

    if (venue.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const bookings = await Booking.find({ venue: req.params.venueId })
      .populate("user", "name email phone address")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("Get venue bookings error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};