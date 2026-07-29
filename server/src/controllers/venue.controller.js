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
      .populate("owner", "name email phone address")
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
    const venue = await Venue.findById(req.params.id).populate("owner", "name email phone address");
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
    const {
      name, location, address, description,
      capacity, category, pricePerHour, pricePerDay,
      amenities, images,
      openTime, closeTime, gapHours, setupHours
    } = req.body;

    let imageUrls = [];
    if (typeof images === "string") {
      imageUrls = images.split(",").map(i => i.trim()).filter(Boolean);
    } else if (Array.isArray(images)) {
      imageUrls = images;
    }
    if (req.files && req.files.images && req.files.images.length > 0) {
      const uploaded = req.files.images.map(file => `/uploads/${file.filename}`);
      imageUrls = [...imageUrls, ...uploaded];
    }
    if (imageUrls.length === 0) {
      imageUrls.push("https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800");
    }

    let licenseUrl = "";
    if (req.files && req.files.license && req.files.license.length > 0) {
      licenseUrl = `/uploads/${req.files.license[0].filename}`;
    }

    let amenitiesArray = [];
    if (typeof amenities === "string") {
      amenitiesArray = amenities.split(",").map(a => a.trim()).filter(Boolean);
    } else if (Array.isArray(amenities)) {
      amenitiesArray = amenities;
    }

    const venue = await Venue.create({
      owner: req.user.id,
      name, location, address, description,
      capacity: Number(capacity),
      category,
      pricePerHour: Number(pricePerHour),
      pricePerDay: pricePerDay ? Number(pricePerDay) : 0,
      openTime: openTime || "08:00",
      closeTime: closeTime || "22:00",
      gapHours: gapHours ? Number(gapHours) : 4,
      setupHours: setupHours ? Number(setupHours) : 2,
      amenities: amenitiesArray,
      images: imageUrls,
      license: licenseUrl,
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

    const updateData = { ...req.body };
    if (updateData.capacity) updateData.capacity = Number(updateData.capacity);
    if (updateData.pricePerHour) updateData.pricePerHour = Number(updateData.pricePerHour);
    if (updateData.pricePerDay !== undefined) updateData.pricePerDay = Number(updateData.pricePerDay);
    if (updateData.gapHours !== undefined) updateData.gapHours = Number(updateData.gapHours);
    if (updateData.setupHours !== undefined) updateData.setupHours = Number(updateData.setupHours);

    if (typeof updateData.amenities === "string") {
      updateData.amenities = updateData.amenities.split(",").map(a => a.trim()).filter(Boolean);
    }
    if (typeof updateData.images === "string") {
      updateData.images = updateData.images.split(",").map(i => i.trim()).filter(Boolean);
    }
    if (req.files && req.files.images && req.files.images.length > 0) {
      const uploaded = req.files.images.map(file => `/uploads/${file.filename}`);
      updateData.images = [...(updateData.images || venue.images), ...uploaded];
    }
    if (req.files && req.files.license && req.files.license.length > 0) {
      updateData.license = `/uploads/${req.files.license[0].filename}`;
    }

    const updated = await Venue.findByIdAndUpdate(req.params.id, updateData, {
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