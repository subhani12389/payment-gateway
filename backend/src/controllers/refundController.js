const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// POST /api/v1/refunds
exports.createRefund = async (req, res) => {
  const { payment_id } = req.body;

  if (!payment_id) {
    return res.status(400).json({
      error: {
        code: "BAD_REQUEST",
        description: "payment_id is required",
      },
    });
  }

  try {
    /* 1️⃣ Find payment */
    const paymentResult = await pool.query(
      `SELECT * FROM payments 
       WHERE id = $1 AND merchant_id = $2`,
      [payment_id, req.merchant.id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        error: {
          code: "PAYMENT_NOT_FOUND",
          description: "Payment not found",
        },
      });
    }

    const payment = paymentResult.rows[0];

    /* 2️⃣ Check if already refunded */
    const refundCheck = await pool.query(
      `SELECT id FROM refunds WHERE payment_id = $1`,
      [payment_id]
    );

    if (refundCheck.rows.length > 0) {
      return res.status(400).json({
        error: {
          code: "REFUND_ALREADY_DONE",
          description: "This payment has already been refunded",
        },
      });
    }

    /* 3️⃣ Create refund */
    const refundId = "rfnd_" + uuidv4().replace(/-/g, "").slice(0, 14);

    const refundResult = await pool.query(
      `INSERT INTO refunds 
       (id, payment_id, merchant_id, amount, status)
       VALUES ($1, $2, $3, $4, 'processed')
       RETURNING *`,
      [
        refundId,
        payment.id,
        req.merchant.id,
        payment.amount,
      ]
    );

    /* 4️⃣ Update payment status */
    await pool.query(
      `UPDATE payments SET status = 'refunded' WHERE id = $1`,
      [payment.id]
    );

    return res.status(201).json({
      id: refundResult.rows[0].id,
      payment_id: refundResult.rows[0].payment_id,
      amount: refundResult.rows[0].amount,
      status: refundResult.rows[0].status,
      created_at: refundResult.rows[0].created_at,
    });
  } catch (err) {
    console.error("Refund error:", err);
    return res.status(500).json({
      error: {
        code: "INTERNAL_SERVER_ERROR",
        description: "Something went wrong",
      },
    });
  }
};
