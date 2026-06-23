# 📁 Project Structure

This document describes the actual repository layout for the QueueLess application.

## Root Directory

```
queueless/
├── Documentation/           # Documentation files (this folder)
├── ai/                      # Python FastAPI AI prediction service
├── backend/                 # Node.js/Express backend service
├── frontend/                # React/Vite frontend application
├── package.json             # Root scripts for multi-service development
├── README.md                # Project root README (not in Documentation folder)
└── .gitignore               # Ignored files
```

## Frontend Structure

```
frontend/
├── index.html               # Vite HTML entry template
├── package.json             # Frontend dependencies and scripts
├── postcss.config.js        # PostCSS config
├── tailwind.config.js       # TailwindCSS config
├── vite.config.js           # Vite build config
├── public/                  # Public static assets
└── src/
    ├── App.jsx              # React routes and protected route wrapper
    ├── main.jsx             # React app initialization
    ├── index.css            # Global CSS
    ├── App.css              # Application-specific CSS
    ├── assets/              # Static image assets
    ├── components/          # Reusable UI components
    │   ├── Navbar.jsx
    │   ├── BottomNav.jsx
    │   └── SkeletonLoader.jsx
    ├── context/             # Context providers
    │   ├── AuthContext.jsx
    │   ├── CartContext.jsx
    │   ├── SocketContext.jsx
    │   ├── ThemeContext.jsx
    │   └── ToastContext.jsx
    ├── pages/               # Application pages
    │   ├── AuthPage.jsx
    │   ├── CartPage.jsx
    │   ├── FoodDetails.jsx
    │   ├── Onboarding.jsx
    │   ├── OrderHistory.jsx
    │   ├── SplashScreen.jsx
    │   ├── StudentDashboard.jsx
    │   ├── StudentMenu.jsx
    │   ├── TokenTracking.jsx
    │   ├── VendorAI.jsx
    │   ├── VendorAnalytics.jsx
    │   ├── VendorDashboard.jsx
    │   ├── VendorInventory.jsx
    │   └── VendorOrders.jsx
    └── utils/
        └── api.js          # Axios instance with auth token interceptor
```

## Backend Structure

```
backend/
├── package.json             # Backend dependencies and scripts
├── src/
│   ├── config/
│   │   └── db.js            # MongoDB connection and retry logic
│   ├── middleware/
│   │   └── authMiddleware.js# JWT authentication and role-based access
│   ├── models/
│   │   ├── Analytics.js
│   │   ├── Feedback.js
│   │   ├── Food.js
│   │   ├── Order.js
│   │   ├── Queue.js
│   │   └── User.js
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── predictionRoutes.js
│   │   └── queueRoutes.js
│   ├── seed.js              # Database seeding script
│   └── index.js             # Backend entry point and server startup
```

## AI Service Structure

```
ai/
├── app.py                   # FastAPI demand prediction service
├── requirements.txt         # Python dependencies
```

## Important Notes

- The frontend currently hardcodes the API base URL at `http://127.0.0.1:5001/api` in `frontend/src/utils/api.js`.
- The backend starts from `backend/src/index.js` and connects to MongoDB using `MONGODB_URI`.
- The AI prediction route is proxied through the backend at `/api/prediction` and requests `AI_SERVICE_URL`.
