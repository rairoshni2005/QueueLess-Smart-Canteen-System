---


# 🍽️ QueueLess – Smart Campus Food & Queue Management System

---

## 🚀 Overview

**QueueLess** is a full-stack smart campus cafeteria management system designed to eliminate long queues, reduce waiting time, and optimize food ordering using real-time tracking and AI-based demand prediction.

It digitizes the entire cafeteria experience for students and provides vendors with powerful analytics and operational control.

The system combines:

- Real-time ordering system
- Token-based queue management
- Vendor analytics dashboard
- AI-powered demand prediction engine

---

## 🎯 Problem Statement

Modern college cafeterias face major inefficiencies during peak hours:

### Student Problems
- Long waiting queues during short breaks
- No visibility of crowd levels
- Wasted time standing in line
- Uncertainty of food availability

### Vendor Problems
- Sudden rush management difficulty
- Manual order tracking
- Food wastage due to poor prediction
- Lack of data-driven insights

---

## 💡 Solution

QueueLess solves these problems using a digital ecosystem:

- 📱 Online food ordering system
- 🎫 Digital token queue system
- 📊 Real-time queue tracking
- 📦 Smart inventory management
- 🤖 AI-based demand forecasting
- 📈 Vendor analytics dashboard

---

## ✨ Key Features

---

### 👨‍🎓 Student Side Features

- Secure authentication system (Login/Register)
- Browse dynamic food menu
- Add items to cart
- Place pre-orders before reaching cafeteria
- Generate digital queue tokens
- Track live queue position
- Get real-time order status updates
- Receive pickup notifications

---

### 👨‍🍳 Vendor Side Features

- Real-time order management dashboard
- Accept / update order status
- Monitor active queue
- View sales analytics
- Track food inventory
- Detect low-stock items
- AI-based demand insights

---

### ⚡ Real-Time Features

- Live queue updates using Socket.io
- Instant order status updates
- Dynamic token movement system
- Live cafeteria crowd tracking

---

### 🤖 AI Features

- Predicts peak rush hours
- Forecasts food demand
- Suggests preparation quantity
- Analyzes historical order data

---

## 🛠️ Tech Stack

---

### Frontend
- React.js
- HTML5
- CSS3
- JavaScript (ES6+)

---

### Backend
- Node.js
- Express.js
- Socket.io (real-time communication)

---

### Database
- MongoDB Atlas (Cloud NoSQL Database)

Used for:
- User data
- Food items
- Orders
- Queue tracking
- Analytics data

---

### AI Layer
- Python
- Machine Learning Model for demand prediction

---

### Tools & Platforms
- Git & GitHub
- Postman (API Testing)
- Figma (UI/UX Design)
- VS Code

---

## ☁️ Database Architecture

MongoDB Atlas is used as the central database system.

### Collections:

- Users
- Foods
- Orders
- Queue
- Analytics

---

## 🏗️ System Architecture



Frontend (React.js)
↓
Backend API (Node.js + Express)
↓
MongoDB Atlas (Database)
↓
AI Prediction Engine (Python ML Model)
↓
Analytics Dashboard



---

## 🔁 Order Workflow



Select Food
↓
Add to Cart
↓
Place Order
↓
Generate Token
↓
Assign Queue Position
↓
Real-Time Tracking
↓
Pickup Notification



---

## 🎫 Queue System Logic

Each order receives a unique token ID.

### Example:



Existing Queue:
Q20 → Q21 → Q22

New Order:
Q23 assigned automatically



### Waiting Time Calculation:



Waiting Time =
Average Preparation Time × Orders Ahead



---

## 📊 AI Prediction System

The AI engine analyzes historical data to predict demand.

### Input Data:
- Previous orders
- Time of day
- Day of week
- Crowd patterns

### Output:
- Expected crowd level
- Rush hour prediction
- Food preparation suggestions

---


## 📡 API Endpoints

---

### 🔐 Authentication

- POST /api/auth/register
- POST /api/auth/login

---

### 🍔 Food

- GET /api/foods

---

### 🧾 Orders

- POST /api/orders
- GET /api/orders/status

---

### 🎫 Queue

- GET /api/queue/status

---

### 📊 Analytics

- GET /api/analytics

---

### 🤖 AI Prediction

- GET /api/prediction

---

## ⚙️ Setup Instructions

---

### 1. Clone Repository


git clone https://github.com/rairoshni2005/QueueLess-Smart-Canteen-System.git
cd QueueLess-Smart-Canteen-System


---

### 2. Install Dependencies


cd backend
npm install

cd ../frontend
npm install


---

### 3. Setup Environment Variables

Create .env file inside backend:


---

### 4. Run Project

#### Backend

npm start


#### Frontend

npm start


---

## ☁️ Deployment

* **Frontend:** Vercel / Netlify
* **Backend:** Render / Railway
* **Database:** MongoDB Atlas
* **AI Service:** FastAPI (Python)

---

## 📈 Future Enhancements

* 📱 Mobile application (Android / iOS)
* 💳 UPI payment integration
* 🤖 Advanced AI recommendations
* 🏫 Multi-campus support system
* 📷 Face recognition queue tracking
* 🔔 Smart notification system

---

## 👩‍💻 Author

**Roshni Rai**
B.Tech CSE | ITM Skills University

---

## 🏆 Project Impact

QueueLess improves campus cafeteria systems by:

* Reducing waiting time drastically
* Eliminating physical queues
* Improving vendor efficiency
* Using AI for better food planning
* Enhancing student experience

---

## ⭐ If you like this project

Give it a ⭐ on GitHub and feel free to contribute!


---








