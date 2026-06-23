# ⚙️ Setup Guide

This guide explains how to set up the QueueLess application locally using the current project implementation.

## Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Python 3.9 or higher
- pip
- MongoDB Atlas account or local MongoDB instance
- Git

## Install Dependencies

### 1. Clone the repository
```bash
git clone https://github.com/your-username/queueless.git
cd queueless
```

### 2. Install root dependencies
```bash
npm install
```

### 3. Install backend dependencies
```bash
npm install --prefix backend
```

### 4. Install frontend dependencies
```bash
npm install --prefix frontend
```

### 5. Install AI service dependencies
```bash
cd ai
pip install -r requirements.txt
cd ..
```

## Environment Variables

### Backend
Create `backend/.env` with the following values:

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/queueless?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
AI_SERVICE_URL=http://127.0.0.1:8000
```

> If you use a local MongoDB instance, set `MONGODB_URI=mongodb://localhost:27017/queueless`.

### Frontend
Create `frontend/.env.local` with the following values:

```env
VITE_API_URL=http://127.0.0.1:5001/api
VITE_SOCKET_URL=http://127.0.0.1:5001
```

### AI Service
Create `ai/.env` with the following values:

```env
PORT=8000
HOST=127.0.0.1
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account.
2. Create a free tier cluster.
3. Add your application IP to Network Access.
4. Create a database user with username/password.
5. Copy the connection string.
6. Replace the placeholder values in `backend/.env`.

Example Atlas URI:
```env
MONGODB_URI=mongodb+srv://myUser:myPassword@cluster0.mongodb.net/queueless?retryWrites=true&w=majority
```

## Run Services

### Backend
```bash
npm run dev --prefix backend
```

### Frontend
```bash
npm run dev --prefix frontend
```

### AI Service
```bash
cd ai
python app.py
```

### Optional: Run all services together
```bash
npm run dev
```

## Seed the Database

From the repository root:
```bash
npm run seed
```

This command runs the backend seeding script located at `backend/src/seed.js`.

## Local URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://127.0.0.1:5001/api`
- AI Service: `http://127.0.0.1:8000`

## Notes

- The frontend currently uses `http://127.0.0.1:5001/api` as the local backend base URL.
- If you change backend port, update `frontend/src/utils/api.js` accordingly.
