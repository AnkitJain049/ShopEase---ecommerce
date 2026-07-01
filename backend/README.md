# ShopEase - API Server & Data Layer

This is the backend service engine for ShopEase, exposing authentication routes, search recommendation APIs, transaction pipelines, customer review controllers, and the Gemini AI support channel.

---

## 📌 Table of Contents

1. [Key Features](#-key-features)
2. [Tech Stack](#-tech-stack)
3. [Folder Structure](#-folder-structure)
4. [Endpoint Reference](#-endpoint-reference)
5. [Database Schema Specs](#-database-schema-specs)
6. [Database Seeding (Data Population)](#-database-seeding-data-population)
7. [Environment Configurations](#-environment-configurations)
8. [Installation & Commands](#-installation--commands)

---

## 🌟 Key Features

- **OAuth & Local Auth**: Secure sessions managed via HTTP-Only cookies using Passport JWT integrations.
- **AI Helpdesk**: Streamed chatbot support utilizing Google Gemini SDK.
- **TF-IDF Search recommendation**: Backend search algorithms built using Natural.js.
- **Sandbox Payments**: Razorpay SDK verification endpoints supporting orders under ₹30,000.
- **Image Processing**: Dynamic file uploading configuration with Multer.

---

## 🛠️ Tech Stack

- **Runtime Environment**: Node.js
- **Web Framework**: Express.js
- **Database Engine**: MongoDB (via Mongoose ODM)
- **NLP / Recommendation**: Natural.js (TF-IDF tokens matcher)
- **Payment Verification**: Razorpay SDK
- **AI Integrations**: Google Gemini API SDK

---

## 📂 Folder Structure

```
backend/
├── models/           # Mongoose schemas (User, Product, Transaction, Review, Chat)
├── routes/           # Express router endpoints (auth, payment, products, user, chatbot)
├── utils/            # Utility assets (auth middleware, database hooks, multer storage configurations)
├── uploads/          # Static file repository for profilePics and productImages
├── seed.js           # Idempotent database seeder script
├── server.js         # Entry point initialization module
├── package.json      # Dependencies config
└── .env             # Environment variables (ignored)
```

---

## 📡 Endpoint Reference

### 🔐 Authentication Routes (`/api/auth`)
- `POST /register` - Register new shopper profile.
- `POST /login` - Establish user session and set secure cookie.
- `POST /logout` - Terminate cookie session.
- `GET /me` - Resolve active shopper credentials.
- `GET /status` - Quick token health validation checks.

### 📦 Product Operations (`/api/products`)
- `GET /` - Fetch catalog items.
- `GET /:id` - Resolve specific product specifications.
- `POST /` - Register a new product listing (requires authentication).
- `PUT /:id` - Modify listing details (restricted to seller).
- `DELETE /:id` - Delete listing (restricted to seller).
- `GET /search/:query` - Run TF-IDF search on target string.

### 💳 Transaction Engine (`/api/payment`)
- `POST /create-order` - Create a Razorpay billing order (Limits: < ₹30,000).
- `POST /verify` - Analyze transaction hashes and log transaction object.
- `GET /transactions` - Fetch user's purchase logs.
- `GET /razorpay-key` - Expose public key ID to checkout client.

---

## 💾 Database Schema Specs

### User Model (`User`)
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `contactNumber` (String, required)
- `profilePic` (String, default: "default.jpg")
- `wishlist` (Array of Product ObjectIds)

### Product Model (`Product`)
- `name` (String, required)
- `description` (String, required)
- `price` (Number, required)
- `sellerId` (User ObjectId, required)
- `image` (String, file path or URL)
- `brand` (String, required)

### Transaction Model (`Transaction`)
- `userId` (User ObjectId, required)
- `productId` (Product ObjectId, required)
- `userName` (String, required)
- `amount` (Number, required)
- `paymentId` (String, required)
- `orderId` (String, required)
- `status` (String, default: 'successful')

---

## 🚀 Database Seeding (Data Population)

ShopEase includes an **idempotent seeder script** to populate mock profiles and purchase history for local visualization.

### What it generates:
- **50 Shoppers**: Set up with individual contact info and unique Dicebear avatars.
- **173 Orders & Reviews**: Distributed randomly over products listed in the DB.

### Run the Seeder:
```bash
node seed.js
```
*Note: The script cleans up its own previously generated mock data matching `shopper*@shopease.com` before running insertions, keeping your primary database entries integral.*

---

## ⚙️ Environment Configurations

Create a `.env` configuration file inside this directory containing:
- `MONGODB_URI`: Connection string (Atlas or local).
- `JWT_SECRET`: Security word key.
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay sandbox key tokens.
- `GEMINI_API_KEY`: API credential key from Google AI Studio.
- `PORT`: Set to `5001` to prevent macOS Airplay port conflicts.

---

## 💻 Installation & Commands

```bash
# Install package dependencies
npm install

# Run backend development server
npm run dev

# Run backend production server
npm start
```