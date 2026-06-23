# 📡 API Documentation

This document describes the current backend API endpoints for QueueLess based on the existing route files.

## Base URL

Local development base URL:
```text
http://127.0.0.1:5001/api
```

## Authentication

### POST /api/auth/register
Register a new user.

**Body:**
```json
{
  "name": "Student Name",
  "email": "student@example.com",
  "password": "password123",
  "role": "student",
  "collegeId": "STU-2026-101"
}
```

**Success Response:**
```json
{
  "_id": "...",
  "name": "Student Name",
  "email": "student@example.com",
  "role": "student",
  "collegeId": "STU-2026-101",
  "token": "<JWT_TOKEN>"
}
```

### POST /api/auth/login
Authenticate user and receive a JWT.

**Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "_id": "...",
  "name": "Student Name",
  "email": "student@example.com",
  "role": "student",
  "collegeId": "STU-2026-101",
  "token": "<JWT_TOKEN>"
}
```

## Authorization

Protected endpoints require the header:
```text
Authorization: Bearer <JWT_TOKEN>
```

## Food Endpoints

### GET /api/foods
Fetch all food items.

**Query Parameters:**
- `category` - optional category filter
- `search` - optional search term

### GET /api/foods/:id
Fetch a single food item by ID.

### POST /api/foods
Create a new food item.

**Access:** Vendor, Admin

**Body:**
```json
{
  "name": "Veg Burger",
  "category": "Snacks",
  "price": 60,
  "stock": 25,
  "availability": true,
  "image": "https://..."
}
```

### PUT /api/foods/:id
Update an existing food item.

**Access:** Vendor, Admin

### DELETE /api/foods/:id
Delete a food item.

**Access:** Vendor, Admin

## Order Endpoints

### POST /api/orders
Place a new order.

**Access:** Student

**Body:**
```json
{
  "items": [
    {
      "foodId": "<foodId>",
      "quantity": 2
    }
  ]
}
```

**Response:** order and queue entry are returned.

### GET /api/orders
Fetch orders.

- Students receive their own order history.
- Vendors and admins receive all orders.

### PUT /api/orders/status
Update an order status.

**Access:** Vendor, Admin

**Body:**
```json
{
  "orderId": "<orderId>",
  "status": "Preparing"
}
```

## Queue Endpoints

### GET /api/queue
Fetch active queue items.

### PUT /api/queue/update
Update a queue entry.

**Access:** Vendor, Admin

**Body:**
```json
{
  "queueId": "<queueId>",
  "position": 1,
  "estimatedTime": 8,
  "status": "Serving"
}
```

## Feedback Endpoints

### POST /api/feedback
Submit feedback for a completed order.

**Access:** Student

**Body:**
```json
{
  "orderId": "<orderId>",
  "foodId": "<foodId>",
  "rating": 5,
  "comment": "Excellent meal."
}
```

### GET /api/feedback
Fetch recent feedback.

**Access:** Vendor, Admin

### GET /api/feedback/rewards
Fetch current student points and badges.

**Access:** Student

## Analytics Endpoints

### GET /api/analytics
Fetch vendor/admin analytics metrics and 7-day historical data.

**Access:** Vendor, Admin

## Prediction Endpoints

### GET /api/prediction
Fetch demand prediction results from the AI service.

**Access:** Vendor, Admin

## Error Handling

Errors return an HTTP status and JSON message, for example:
```json
{
  "message": "Not authorized, token failed"
}
```
