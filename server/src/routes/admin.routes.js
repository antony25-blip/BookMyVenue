const express = require("express");
const router = express.Router();

const {
  getDashboard,
  getAllUsers,
  deleteUser,
  getAllVenues,
  approveVenue,
  rejectVenue,
  deleteVenue,
  getAllBookings,
  getAllPayments,
} = require("../controllers/admin.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// All admin routes — must be logged in + admin role
router.use(protect);
router.use(authorizeRoles("admin"));

// Dashboard
router.get("/dashboard", getDashboard);

// Users
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// Venues
router.get("/venues", getAllVenues);
router.put("/venues/:id/approve", approveVenue);
router.put("/venues/:id/reject", rejectVenue);
router.delete("/venues/:id", deleteVenue);

// Bookings
router.get("/bookings", getAllBookings);

// Payments
router.get("/payments", getAllPayments);

module.exports = router;