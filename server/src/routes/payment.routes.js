const express = require("express");
const router = express.Router();

const {
  initiatePayment,
  getPaymentById,
  getMyPayments,
} = require("../controllers/payment.controller");

const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// All routes require login
router.use(protect);

router.post("/", authorizeRoles("user"), initiatePayment);
router.get("/my-payments", authorizeRoles("user"), getMyPayments);
router.get("/:id", getPaymentById);

module.exports = router;