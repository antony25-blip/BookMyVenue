const Booking = require("../models/Booking");
const Venue = require("../models/Venue");
const VenueAvailability = require("../models/VenueAvailability");

// Helper: check if a new slot overlaps with existing booked slots
const isSlotOverlapping = (bookedSlots, startTime, endTime) => {
  return bookedSlots.some((slot) => {
    return startTime < slot.endTime && endTime > slot.startTime;
  });
};

// @route   POST /api/bookings
// @access  Private (user)
exports.createBooking = async (req, res) => {
  try {
    const { venueId, bookingDate, startTime, endTime, guests } = req.body;

    if (!venueId || !bookingDate || !startTime || !endTime || !guests) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check venue exists and is approved
    const venue = await Venue.findById(venueId);
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });
    if (!venue.isApproved) return res.status(400).json({ success: false, message: "Venue is not available for booking" });

    // Check guest capacity
    if (guests > venue.capacity) {
      return res.status(400).json({ success: false, message: `Venue capacity is ${venue.capacity} guests` });
    }

    // Check slot availability
    const dateObj = new Date(bookingDate);
    let availability = await VenueAvailability.findOne({ venue: venueId, date: dateObj });

    if (availability && !availability.isAvailable) {
      return res.status(400).json({ success: false, message: "Venue is not available on this date" });
    }

    if (availability && isSlotOverlapping(availability.bookedSlots, startTime, endTime)) {
      return res.status(400).json({ success: false, message: "Selected time slot is already booked" });
    }

    // Calculate total amount
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const hours = (end - start) / (1000 * 60 * 60);
    const totalAmount = hours * venue.pricePerHour;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      venue: venueId,
      bookingDate: dateObj,
      startTime,
      endTime,
      guests,
      totalAmount,
      status: "pending",
    });

    // Update availability — add booked slot
    if (availability) {
      availability.bookedSlots.push({ startTime, endTime });
      await availability.save();
    } else {
      await VenueAvailability.create({
        venue: venueId,
        date: dateObj,
        bookedSlots: [{ startTime, endTime }],
      });
    }

    await booking.populate("venue", "name location address images pricePerHour");

    res.status(201).json({ success: true, message: "Booking created successfully", booking });
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
      .populate("venue", "name location address images pricePerHour")
      .populate("user", "name email phone");

    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    // Only the booking user, the venue owner, or admin can view
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

    // Free up the slot in availability
    await VenueAvailability.updateOne(
      { venue: booking.venue, date: booking.bookingDate },
      { $pull: { bookedSlots: { startTime: booking.startTime, endTime: booking.endTime } } }
    );

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

    // Only venue owner can confirm
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
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error("Get venue bookings error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};