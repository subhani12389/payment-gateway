
require("dotenv").config();
const refundRoutes = require("./routes/refundRoutes");



const express = require("express");
const cors = require("cors");

const initDb = require("./db/init");

const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(cors());
app.use(express.json());

/* -------------------- HEALTH CHECK -------------------- */
app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "healthy",
    database: "connected",
    timestamp: new Date().toISOString(),
  });
});

/* -------------------- API ROUTES -------------------- */
app.use("/api/v1/orders", authMiddleware, orderRoutes);
app.use("/api/v1/payments", authMiddleware, paymentRoutes);
app.use("/api/v1/refunds", authMiddleware, refundRoutes);


/* -------------------- SERVER START -------------------- */
const PORT = process.env.PORT || 8000;

(async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 API running on port ${PORT}`);
      console.log("✅ Database initialized");
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
