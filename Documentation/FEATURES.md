# ✅ Features Documentation

This document describes the current feature set implemented in QueueLess.

## Student Features

- **Account registration and login** with email/password.
- **Onboarding journey** for first-time users.
- **Student dashboard** with recommendations and queue status.
- **Food menu browsing** with category filters and search.
- **Food details** including image, category, price, and availability.
- **Cart management** with quantity adjustment and order review.
- **Order placement** with token generation and queue assignment.
- **Token tracking** for real-time order status.
- **Order history** displaying past orders.
- **Feedback submission** for completed orders.
- **Points and badges** managed through feedback and orders.

## Vendor Features

- **Vendor dashboard** for live order monitoring.
- **Order management** for status updates.
- **Inventory management** for food items.
- **Analytics dashboard** with revenue and order history.
- **AI demand prediction** via the AI service.
- **Customer feedback view** for vendor insights.
- **Role-based access control** restricting vendor functionality.

## AI/ML Features

- **Demand prediction service** using FastAPI.
- **Tomorrow’s demand forecast** for peak hours.
- **Popular item recommendations** based on predicted demand.
- **Resilient fallback** when AI service is unavailable.

## System Features

- **MongoDB Atlas support** via `MONGODB_URI`.
- **JWT authentication** for all protected routes.
- **Socket.io real-time updates** for queue and order events.
- **Backend seeding** via `backend/src/seed.js`.
- **Express.js API** with structured route modules.
- **React/Vite frontend** with context providers and protected routes.
- **TailwindCSS styling** and responsive layout.
