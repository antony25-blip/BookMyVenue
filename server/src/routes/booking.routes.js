const express = require("express");
const router = express.Router();

const {
  createBooking,
  getBookingById,
  cancelBooking,
  confirmBooking,
  getVenueBookings,
} = require("../controllers/booking.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// All routes require login
router.use(protect);

// User
router.post("/", authorizeRoles("user"), createBooking);
router.put("/:id/cancel", authorizeRoles("user"), cancelBooking);

// Venue owner
router.put("/:id/confirm", authorizeRoles("venue_owner"), confirmBooking);
router.get("/venue/:venueId", authorizeRoles("venue_owner", "admin"), getVenueBookings);

// User + admin
router.get("/:id", getBookingById);

module.exports = router;