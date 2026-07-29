require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Seed the one fixed admin account
const seedAdmin = async () => {
  const ADMIN_EMAIL = "admin@gmail.com";
  const ADMIN_PASSWORD = "admin";
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (!existing) {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, salt);
    await User.create({
      name: "Admin",
      email: ADMIN_EMAIL,
      password: hashed,
      role: "admin",
      phone: "0000000000",
      address: "BookMyVenue HQ",
    });
    console.log(`[SEED] Admin account created → ${ADMIN_EMAIL}`);
  } else {
    console.log(`[SEED] Admin account already exists → ${ADMIN_EMAIL}`);
  }
};

// Start database and server
const startServer = async () => {
  await connectDB();
  await seedAdmin();
  app.listen(PORT, () => {
    console.log(`[SERVER] Running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
