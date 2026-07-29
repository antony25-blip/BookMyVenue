const express = require("express");
const cors = require("cors");
const path = require("path");
const { notFound, errorHandler } = require("./middleware/error.middleware");

// Routes imports
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const venueRoutes = require("./routes/venue.routes");
const bookingRoutes = require("./routes/booking.routes");
const paymentRoutes = require("./routes/payment.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// Standard middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for local uploads)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "BookMyVenue API is running smoothly!" });
});

// Routing
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;
