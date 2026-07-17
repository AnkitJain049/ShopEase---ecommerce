# ShopEase - Single Page Application Frontend

This folder holds the interactive client-side web application for ShopEase, built with React, Vite, and custom Vanilla CSS.

---

## 📌 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Folder Layout](#-folder-layout)
4. [Ecosystem Pages](#-ecosystem-pages)
5. [Ecosystem Components](#-ecosystem-components)
6. [Ecosystem Custom Hooks](#-ecosystem-custom-hooks)
7. [Environment Configuration](#-environment-configuration)
8. [Installation & Setup](#-installation--setup)

---

## 🌟 Features

- **Performance Diagnostics Workspace**: Live admin panel (`/admin/metrics`) rendering cache performance statistics, database vs RAM latency ratios, and recent shopper data.
- **Interactive Logs Pagination**: Tabulated metrics interface loading logs in sets of 10 with a custom "Load More" button showing remaining entries.
- **JSON Log Download**: On-click REST trigger downloading pretty-printed diagnostic logs directly as `.json` files.
- **Interactive Glassmorphic Header**: Real-time URL synced search parameters preserving browser history states.
- **Direct checkout payments**: Friction-free Razorpay checkout dialog triggered immediately on product pages.
- **Responsive Standard Layouts**: Structured image grids and hidden scroll indicators for descriptions.
- **Support Chat Desk**: Sticky glass-morphic conversation widget with instant response handling.
- **Visual Switcher Tabs**: Smooth user profiles switches listing custom products, wishes, and reviews.

---

## 🛠️ Tech Stack

- **Runtime Client Framework**: React.js
- **Build Engine**: Vite (React SWC configuration)
- **Routing Engine**: React Router DOM v7
- **Aesthetic Assets**: Google Fonts (Outfit & Inter), Dicebear SVG avatars
- **Theme styles**: Custom CSS variables, media queries, backdrop filters

---

## 📂 Folder Layout

```
frontend/
├── src/
│   ├── components/    # Reusable markup pods (Chatbot, buy buttons, rating stars)
│   ├── hooks/         # Custom React hooks (useFetch, useWishlist, useAggregateRating)
│   ├── pages/         # Page components (Home, Landing, Product Details, User Profiles, AdminMetrics)
│   ├── main.jsx       # App initialization & Route maps
│   ├── main.css       # Theme style declarations, fonts, scroll utilities
│   └── Navbar.jsx     # Navigation bar controller
├── public/            # Static assets
├── index.html         # Application root HTML document
├── package.json       # Frontend dependencies configuration
└── .env               # API URL environment parameters (ignored)
```

---

## 🖥️ Ecosystem Pages

- **Admin Metrics (`AdminMetrics.jsx`)**: Lock-protected performance statistics workspace containing Cache Hit Rate meters, Dual-POV timing logs, shopper lists, and transaction histories.
- **Landing page (`Landing.jsx`)**: Split responsive gate offering clean entry showcase animations.
- **Home page (`Home.jsx`)**: Catalog matrix, interactive search banners, category switches.
- **Product Details (`Productdetails.jsx`)**: Layout containing ratings, brand metadata, reviews list, and Direct Razorpay triggers.
- **User Profile (`UserProfile.jsx`)**: Shopper account overview utilizing dynamic sliding tab switcher panels.

---

## 🧩 Ecosystem Components

- **Chatbot Window (`Chatbot.jsx`)**: Floating glass card rendering support queries with past conversation awareness.
- **Card grid (`Card.jsx`)**: Smooth scale effects, item description limits, tags styling.
- **Order history lists (`ToggleUserData.jsx`)**: Tab switcher managing transactional lists and status indicator circles.

---

## ⚓ Ecosystem Custom Hooks

- `useFetch`: Handles backend API queries. Upgraded to automatically track client-side roundtrip query latencies using `performance.now()`, read server cache headers (`X-Cache-Status`), report timing metrics asynchronously to `/api/admin/report-latency`, and return reactive `loading` and `error` states.
- `useWishlist`: Keeps track of wish state caches, addition triggers, and catalog synchronization.
- `useAggregateRating`: Computes stars ratios based on reviews.

---

## ⚙️ Environment Configuration

Set up a `.env` file in this directory to specify your backend address:
```env
VITE_API_BASE_URL=http://localhost:5001
```

---

## 💻 Installation & Setup

```bash
# Navigate to frontend folder
cd frontend

# Install package dependencies
npm install

# Start Vite client development server
npm run dev

# Compile files into production-ready bundle
npm run build
```
The client application will run on `http://localhost:5173/`.
