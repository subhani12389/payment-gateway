const pool = require("../db");

// Generate order id
function generateOrderId() {
  return "order_" + Math.random().toString(36).substring(2, 18);
}

// POST /api/v1/orders
exports.createOrder = async (req, res) => {
  const { amount, currency = "INR", receipt, notes = {} } = req.body;

  if (!amount || amount < 100) {
    return res.status(400).json({
      error: { code: "BAD_REQUEST", description: "Invalid amount" },
    });
  }

  const orderId = generateOrderId();

  const result = await pool.query(
    `INSERT INTO orders (id, merchant_id, amount, currency, receipt, notes, status)
     VALUES ($1,$2,$3,$4,$5,$6,'created') RETURNING *`,
    [orderId, req.merchant.id, amount, currency, receipt, notes]
  );

  res.status(201).json(result.rows[0]);
};

// GET /api/v1/orders/:order_id
exports.getOrder = async (req, res) => {
  const { order_id } = req.params;

  const result = await pool.query(
    "SELECT * FROM orders WHERE id=$1 AND merchant_id=$2",
    [order_id, req.merchant.id]
  );

  if (!result.rows.length) {
    return res.status(404).json({ error: "Order not found" });
  }

  res.json(result.rows[0]);
};
