const Venue = require("../models/Venue");
const VenueAvailability = require("../models/VenueAvailability");
const Review = require("../models/Review");

// @route   GET /api/venues
// @access  Public — Search & Filter venues
exports.getAllVenues = async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, capacity, search } = req.query;

    const filter = { isApproved: true };

    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: "i" };
    if (capacity) filter.capacity = { $gte: Number(capacity) };
    if (minPrice || maxPrice) {
      filter.pricePerHour = {};
      if (minPrice) filter.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerHour.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const venues = await Venue.find(filter)
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: venues.length, venues });
  } catch (error) {
    console.error("Get venues error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/venues/:id
// @access  Public
exports.getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id).populate("owner", "name email phone");
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });

    // Fetch reviews for this venue
    const reviews = await Review.find({ venue: req.params.id })
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    res.json({ success: true, venue, reviews, avgRating });
  } catch (error) {
    console.error("Get venue error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   POST /api/venues
// @access  Private (venue_owner)
exports.createVenue = async (req, res) => {
  try {
    const { name, location, address, description, capacity, category, pricePerHour, amenities, images } = req.body;

    const venue = await Venue.create({
      owner: req.user.id,
      name, location, address, description,
      capacity, category, pricePerHour,
      amenities: amenities || [],
      images: images || [],
    });

    res.status(201).json({ success: true, message: "Venue created, pending admin approval", venue });
  } catch (error) {
    console.error("Create venue error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   PUT /api/venues/:id
// @access  Private (venue_owner — own venue only)
exports.updateVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });

    if (venue.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this venue" });
    }

    const updated = await Venue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: "Venue updated", venue: updated });
  } catch (error) {
    console.error("Update venue error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   DELETE /api/venues/:id
// @access  Private (venue_owner — own venue only)
exports.deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ success: false, message: "Venue not found" });

    if (venue.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this venue" });
    }

    await venue.deleteOne();
    res.json({ success: true, message: "Venue deleted" });
  } catch (error) {
    console.error("Delete venue error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/venues/owner/my-venues
// @access  Private (venue_owner)
exports.getMyVenues = async (req, res) => {
  try {
    const venues = await Venue.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: venues.length, venues });
  } catch (error) {
    console.error("Get my venues error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   GET /api/venues/:id/availability?date=2025-06-10
// @access  Public
exports.getVenueAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: "Date is required" });

    const availability = await VenueAvailability.findOne({
      venue: req.params.id,
      date: new Date(date),
    });

    if (!availability) {
      return res.json({ success: true, isAvailable: true, bookedSlots: [] });
    }

    res.json({
      success: true,
      isAvailable: availability.isAvailable,
      bookedSlots: availability.bookedSlots,
    });
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @route   POST /api/venues/:id/reviews
// @access  Private (user)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Check if user already reviewed this venue
    const existing = await Review.findOne({ user: req.user.id, venue: req.params.id });
    if (existing) {
      return res.status(400).json({ success: false, message: "You have already reviewed this venue" });
    }

    const review = await Review.create({
      user: req.user.id,
      venue: req.params.id,
      rating,
      comment,
    });

    res.status(201).json({ success: true, message: "Review added", review });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};