# 🏗️ Architecture Guide

This document describes QueueLess's current architecture, data flow, technology stack, and integration points.

## High-Level Architecture

QueueLess is implemented as a modern web application with three layers:

- **Frontend:** React.js application served locally via Vite.
- **Backend:** Express.js REST API with Socket.io for real-time updates.
- **AI Service:** Python FastAPI service for demand prediction.

MongoDB is the primary database, and the backend connects via `MONGODB_URI`, which is compatible with MongoDB Atlas.

## Technology Stack

- Frontend: React.js, Vite, TailwindCSS, React Router, Socket.io Client
- Backend: Node.js, Express, Mongoose, Socket.io Server, JWT, bcryptjs
- Database: MongoDB Atlas or local MongoDB
- AI Service: Python, FastAPI, scikit-learn, pandas, numpy

## Backend Architecture

The backend is structured around a central Express app in `backend/src/index.js`.

Key files:
- `backend/src/config/db.js` - MongoDB connection logic with retry and event logging.
- `backend/src/middleware/authMiddleware.js` - JWT authentication and role-based authorization.
- `backend/src/routes/*.js` - API route definitions.
- `backend/src/models/*.js` - Mongoose schemas for Users, Foods, Orders, Queue, Feedback, Analytics.
- `backend/src/seed.js` - Seed script for populating initial data.

## API Layer

The backend exposes REST endpoints under `/api`:

- `/api/auth` - authentication and user registration
- `/api/foods` - food catalog management
- `/api/orders` - order placement and status updates
- `/api/queue` - queue tracking and manual queue updates
- `/api/feedback` - student feedback and rewards
- `/api/analytics` - vendor analytics metrics
- `/api/prediction` - AI demand prediction proxy

## Real-time Communication

Socket.io is used for live updates between the backend and frontend.

### Events emitted by the backend
- `orderCreated` - when a new order is placed
- `queueUpdate` - when queue data changes
- `orderStatusChanged` - when an order status changes

The frontend listens to these events to update the dashboard, queue view, and order tracking UI in real time.

## AI Service Integration

The AI service is defined in `ai/app.py` and exposes:
- `GET /` - health check
- `GET /api/prediction` - demand prediction payload

The backend route `/api/prediction` forwards requests to the AI service URL configured in `backend/.env` via `AI_SERVICE_URL`.

The backend also contains a fallback prediction implementation if the Python service is unavailable.

## Database Design

### Users
- `name`, `email`, `password`, `role`, `collegeId`, `points`, `badges`

### Foods
- `name`, `image`, `category`, `price`, `stock`, `availability`

### Orders
- `userId`, `items`, `tokenNumber`, `status`, `totalAmount`

### Queue
- `orderId`, `position`, `estimatedTime`, `status`

### Feedback
- `userId`, `orderId`, `foodId`, `rating`, `comment`

### Analytics
- `date`, `orders`, `revenue`, `peakHour`

## Security

- JWT protects private APIs.
- Role-based access restricts vendor/admin-only operations.
- Auth middleware validates tokens and user permissions.

## Deployment Notes

- Backend and frontend can run independently.
- `backend/.env` controls the MongoDB connection and AI service URL.
- `frontend/src/utils/api.js` currently hardcodes the local API base URL.
- Use MongoDB Atlas for production and a local MongoDB instance for development.
