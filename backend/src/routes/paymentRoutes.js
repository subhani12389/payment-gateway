const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");

// POST /api/v1/payments
router.post("/", paymentController.createPayment);

module.exports = router;
