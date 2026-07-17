# ShopEase - API Server & Data Layer

This is the backend service engine for ShopEase, exposing authentication routes, search recommendation APIs, transaction pipelines, customer review controllers, the Gemini AI support channel, and the diagnostic log caching manager.

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

- **In-Memory Cache Middleware**: Custom cache wrapper in `backend/utils/cache.js` caching catalog lists (`GET /api/products`) in Node.js process heap memory for 60 seconds (latency dropping to **<1ms**). Automatically invalidates cache on product additions, updates, or deletions.
- **Custom sliding-window Rate Limiter**: Middleware built in `backend/utils/rateLimiter.js` restricting request spikes on sensitive endpoints (Login: 20req/15m, Register: 10req/15m, Checkout Order creation: 15req/15m).
- **Diagnostics log Persistence & Rotation**: Appends server timings and client network latencies to `backend/logs/*.jsonl` files. Automatically enforces a **500-line limit** by truncating the oldest lines on new logs.
- **OAuth & Local Auth**: Secure sessions managed via HTTP-Only cookies using Passport JWT integrations.
- **AI Helpdesk**: Streamed chatbot support utilizing Google Gemini SDK (`gemini-1.5-flash` model swap for <1s response speed) parsing the last 6 messages from database session chat history.
- **TF-IDF Search recommendation**: Backend search algorithms built using Natural.js.
- **Sandbox Payments**: Razorpay SDK verification endpoints supporting orders under ₹30,000.

---

## 🛠️ Tech Stack

- **Runtime Environment**: Node.js
- **Web Framework**: Express.js
- **Database Engine**: MongoDB (via Mongoose ODM)
- **NLP / Recommendation**: Natural.js (TF-IDF tokens matcher)
- **Payment Verification**: Razorpay SDK
- **AI Integrations**: Google Gemini API SDK
- **Diagnostic persistence**: File-based JSONL (JSON lines) rotating logs

---

## 📂 Folder Structure

```
backend/
├── logs/             # JSONL persist logs (system_metrics.jsonl, user_metrics.jsonl)
├── models/           # Mongoose schemas (User, Product, Transaction, Review, Chat)
├── routes/           # Express router endpoints (auth, payment, products, user, chatbot, admin)
├── utils/            # Utility assets (auth, database, cache middleware, rate limiter, metrics tracker)
├── uploads/          # Static file repository for profilePics and productImages
├── seed.js           # Idempotent database seeder script
├── server.js         # Entry point initialization module
├── package.json      # Dependencies config
└── .env             # Environment variables (ignored)
```

---

## 📡 Endpoint Reference

### 🔐 Authentication Routes (`/api/auth`)
- `POST /register` - Register new shopper profile (Rate limited).
- `POST /login` - Establish user session and set secure cookie (Rate limited).
- `POST /logout` - Terminate cookie session.
- `GET /me` - Resolve active shopper credentials.
- `GET /status` - Quick token health validation checks.

### 📦 Product Operations (`/api/products`)
- `GET /` - Fetch cached catalog items (cached 60s, returns `<1ms`).
- `GET /:id` - Resolve specific product specifications (cached 65s).
- `POST /` - Register a new product listing (invalidates cache).
- `PUT /:id` - Modify listing details (invalidates cache).
- `DELETE /:id` - Delete listing (invalidates cache).
- `GET /search/:query` - Run TF-IDF search on target string.

### 💳 Transaction Engine (`/api/payment`)
- `POST /create-order` - Create a Razorpay billing order (Limits: < ₹30,000, Rate limited).
- `POST /verify` - Analyze transaction hashes and log transaction object.
- `GET /transactions` - Fetch user's purchase logs.
- `GET /razorpay-key` - Expose public key ID to checkout client.

### 📊 Administrative Metrics Routing (`/api/admin`)
- `GET /metrics` - Resolves server hit rates, user roundtrips, registered profiles, and order records (Restricted: `ankit1@gmail.com` and `admin@gmail.com`).
- `POST /report-latency` - Logs client browser roundtrip durations.
- `GET /download-logs?type=system|user` - Converts internal JSONL logs into formatted JSON arrays and downloads them directly.

---

## 💾 Database Schema Specs

Refer to root `README.md` for User, Product, and Transaction models.

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