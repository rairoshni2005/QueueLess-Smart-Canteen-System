# 🎨 UI/UX Guide

This guide describes the current design principles, UI patterns, and frontend structure used in QueueLess.

## Design Philosophy

QueueLess is designed to be:
- Simple and easy to understand
- Fast and responsive
- Mobile-first
- Clear in feedback and status

## Brand and Colors

The current UI uses a modern palette with warm accents and high contrast.

### Primary colors
- Orange brand accent for call-to-actions and highlights
- Dark text on light surfaces for readability
- Soft card backgrounds with shadow depth

### Layout
- Header navigation uses `Navbar`.
- Mobile bottom navigation uses `BottomNav`.
- Pages use consistent card patterns and spacing.
- Animations are subtle and support status changes.

## Key Components

- `Navbar.jsx` — top application navigation and user status.
- `BottomNav.jsx` — persistent mobile navigation.
- `SkeletonLoader.jsx` — skeleton placeholders during loading.
- `AuthContext.jsx` — manages authentication state.
- `CartContext.jsx` — manages the shopping cart.
- `SocketContext.jsx` — handles real-time Socket.io state.
- `ThemeContext.jsx` — toggles dark mode.
- `ToastContext.jsx` — displays notifications.

## Frontend Pages

- `SplashScreen.jsx` — first launch introductory screen.
- `Onboarding.jsx` — collects user preferences and completes onboarding.
- `AuthPage.jsx` — login and register UI.
- `StudentDashboard.jsx` — student home screen with quick actions.
- `StudentMenu.jsx` — menu browsing and search.
- `FoodDetails.jsx` — detailed item view.
- `CartPage.jsx` — review cart and checkout.
- `TokenTracking.jsx` — live order status and queue tracking.
- `OrderHistory.jsx` — past orders and reorder flow.
- `VendorDashboard.jsx` — vendor overview and metrics.
- `VendorOrders.jsx` — vendor order list and status controls.
- `VendorInventory.jsx` — food item inventory management.
- `VendorAnalytics.jsx` — sales and demand analytics.
- `VendorAI.jsx` — demand prediction insights.

## Experience Notes

- The app uses protected routes to redirect unauthenticated users.
- The current frontend API base URL is hardcoded at `http://127.0.0.1:5001/api`.
- Dark mode is supported through theme state.
- The layout is optimized for small screens.

## Interaction Patterns

- Clear primary actions with bold buttons.
- Status indicators for queue and order progress.
- Consistent card and list components.
- User feedback via toast notifications.
