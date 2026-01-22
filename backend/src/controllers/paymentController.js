const pool = require("../db");

// Helper: generate payment ID
function generatePaymentId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "pay_";
  for (let i = 0; i < 14; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// POST /api/v1/payments
exports.createPayment = async (req, res) => {
  const { order_id, method, vpa } = req.body;

  if (!order_id || !method) {
    return res.status(400).json({
      error: {
        code: "BAD_REQUEST_ERROR",
        description: "order_id and method are required",
      },
    });
  }

  try {
    /* 1️⃣ Verify order exists and belongs to merchant */
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND merchant_id = $2`,
      [order_id, req.merchant.id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "ORDER_NOT_FOUND",
          description: "Order not found",
        },
      });
    }

    const order = orderResult.rows[0];

    /* 2️⃣ BLOCK duplicate payments */
    const existingPayment = await pool.query(
      `SELECT id FROM payments 
       WHERE order_id = $1 AND status = 'captured'`,
      [order_id]
    );

    if (existingPayment.rowCount > 0) {
      return res.status(409).json({
        error: {
          code: "PAYMENT_ALREADY_DONE",
          description: "This order has already been paid",
        },
      });
    }

    /* 3️⃣ Create payment */
    const paymentId = generatePaymentId();

    const paymentResult = await pool.query(
      `INSERT INTO payments
        (id, order_id, merchant_id, amount, currency, method, status, vpa)
       VALUES ($1, $2, $3, $4, $5, $6, 'captured', $7)
       RETURNING *`,
      [
        paymentId,
        order.id,
        req.merchant.id,
        order.amount,
        order.currency,
        method,
        vpa || null,
      ]
    );

    /* 4️⃣ Update order status */
    // ✅ Update order status to PAID
        await pool.query(
        `UPDATE orders
        SET status = 'paid', updated_at = NOW()
        WHERE id = $1`,
        [order.id]
        );


    return res.status(201).json({
      id: paymentResult.rows[0].id,
      order_id: paymentResult.rows[0].order_id,
      amount: paymentResult.rows[0].amount,
      currency: paymentResult.rows[0].currency,
      method: paymentResult.rows[0].method,
      status: paymentResult.rows[0].status,
      vpa: paymentResult.rows[0].vpa,
      created_at: paymentResult.rows[0].created_at,
    });
  } catch (err) {
    console.error("Create payment error:", err);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Something went wrong",
      },
    });
  }
};
