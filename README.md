# Payment Gateway System

## 📌 Project Overview
This project is a backend payment gateway system developed to handle
payment initiation, verification, and transaction management securely.

## 🛠 Technologies Used
- Node.js
- Express.js
- MongoDB
- Docker
- Git & GitHub

## 📂 Project Structure
payment-gateway
├── controllers
├── routes
├── models
├── config
├── middleware
├── docker-compose.yml
└── server.js

## ⚙️ How to Run the Project
1. Clone the repository
2. Install dependencies using `npm install`
3. Create a `.env` file and add required variables
4. Start the server using `npm start`

## 🔐 Environment Variables
PORT  
MONGO_URI  
PAYMENT_SECRET  

## 🔄 API Endpoints
### 1️⃣ Create Payment
**POST** `/api/v1/payments`

#### Request Body
```json
{
  "order_id": "order_12345",
  "method": "upi",
  "vpa": "user@upi"
}

 Success Response (201)
 {
  "id": "pay_xxxxxxxxxxxxxx",
  "order_id": "order_12345",
  "amount": 500,
  "currency": "INR",
  "method": "upi",
  "status": "captured",
  "vpa": "user@upi",
  "created_at": "2026-01-22T10:30:00.000Z"
}
Error Responses

{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "description": "Order not found"
  }
}

{
  "error": {
    "code": "PAYMENT_ALREADY_DONE",
    "description": "This order has already been paid"
  }
}

POST /api/payment/verify  
GET  /api/payment/status  

## 🧪 Testing
All APIs were tested using Postman.

## 🚀 Future Enhancements
- Add refund feature
- Add admin dashboard
- Improve security

## 🏗 System Architecture

Client (Postman / Frontend)
↓
Backend API (Node.js + Express)
↓
Authentication Middleware (Merchant Validation)
↓
Payment Controller
↓
PostgreSQL Database
├── orders table
└── payments table


### Architecture Explanation
- Client sends payment request to backend API
- Backend authenticates merchant
- Controller validates order and payment details
- Payment and order data stored securely in database
- Response sent back to client


## 👨‍💻 Author
MAHABOOB SUBHANI SHAIK
