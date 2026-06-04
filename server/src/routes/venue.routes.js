const express = require("express");
const router = express.Router();

const {
  getAllVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
  getMyVenues,
  getVenueAvailability,
  addReview,
} = require("../controllers/venue.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");
const { uploadMultiple } = require("../middleware/upload.middleware");

// Public
router.get("/", getAllVenues);
router.get("/:id", getVenueById);
router.get("/:id/availability", getVenueAvailability);

// Private — user only
router.post("/:id/reviews", protect, authorizeRoles("user"), addReview);

// Private — venue_owner only
router.get("/owner/my-venues", protect, authorizeRoles("venue_owner"), getMyVenues);
router.post("/", protect, authorizeRoles("venue_owner"), uploadMultiple, createVenue);
router.put("/:id", protect, authorizeRoles("venue_owner"), uploadMultiple, updateVenue);
router.delete("/:id", protect, authorizeRoles("venue_owner"), deleteVenue);

module.exports = router;