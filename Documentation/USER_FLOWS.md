# 👥 User Flows

This document describes the primary user journeys supported by QueueLess.

## Student Flow: Order Food and Track Queue

1. Open the app and complete onboarding.
2. Log in via `/auth`.
3. Land on student dashboard or root route.
4. Navigate to `/menu` and browse categories.
5. Search or filter food items.
6. View item details on `/food/:id`.
7. Add items to the cart.
8. Review the cart on `/cart`.
9. Place the order.
10. Receive a token and view `/track/:id`.
11. Watch real-time status updates via Socket.io.
12. Pick up the order when ready.
13. Submit feedback via `/api/feedback` for completed orders.

## Student Flow: Order History and Rewards

1. Log in as a student.
2. Navigate to `/history`.
3. View completed orders and reorder if desired.
4. Review rewards and badges in the profile section.
5. Submit feedback to earn points.

## Vendor Flow: Manage Orders and Inventory

1. Log in as a vendor or admin.
2. Land on `VendorDashboard`.
3. View active orders, revenue, and queue status.
4. Navigate to `/orders` to manage order statuses.
5. Update orders to `Preparing`, `Ready`, or `Completed`.
6. Navigate to `/inventory` to create, update, or delete food items.
7. Navigate to `/analytics` for sales and demand history.
8. Navigate to `/ai` for demand prediction insights.

## AI Prediction Flow

1. Vendor opens `/ai`.
2. Frontend requests `/api/prediction` from the backend.
3. Backend proxies the request to the AI service at `AI_SERVICE_URL`.
4. If AI service is available, backend returns predictions.
5. If the AI service is offline, backend returns a fallback prediction payload.

## Onboarding Flow

1. First-time user sees `/splash`.
2. User completes onboarding via `/onboarding`.
3. After onboarding, the user is redirected to `/auth` or the dashboard.
4. Onboarding completion is stored in local storage.

## Authentication Flow

1. User navigates to `/auth`.
2. User enters credentials and logs in.
3. Backend issues a JWT token.
4. Frontend stores the token in local storage as `queueless_token`.
5. Protected routes validate the token before rendering.
