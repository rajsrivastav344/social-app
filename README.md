# 🌐 SocialSpace — Mini Social Post App

A full-stack social media application built with **React.js**, **Node.js + Express**, and **MongoDB**.
Inspired by the TaskPlanet Social Feed UI.

---

## 📁 Project Structure

```
social-app/
├── backend/                  # Node.js + Express API
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication middleware
│   │   └── upload.js         # Multer image upload middleware
│   ├── models/
│   │   ├── User.js           # User schema (MongoDB collection: users)
│   │   └── Post.js           # Post schema (MongoDB collection: posts)
│   ├── routes/
│   │   ├── auth.js           # /api/auth — signup, login, me
│   │   └── posts.js          # /api/posts — CRUD, like, comment
│   ├── uploads/              # Local image storage (dev only)
│   ├── server.js             # Express app entry point
│   ├── .env.example          # Environment variable template
│   └── package.json
│
└── frontend/                 # React.js app
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js       # Top navigation bar
    │   │   ├── CreatePost.js   # Post creation card
    │   │   └── PostCard.js     # Individual post with like/comment
    │   ├── context/
    │   │   └── AuthContext.js  # Global auth state (React Context)
    │   ├── pages/
    │   │   ├── FeedPage.js     # Main feed with infinite scroll
    │   │   ├── LoginPage.js    # Login form
    │   │   └── SignupPage.js   # Signup form
    │   ├── utils/
    │   │   └── api.js          # Axios API helper functions
    │   ├── App.js              # Routes + Theme setup
    │   └── index.js            # React entry point
    ├── .env.example
    └── package.json
```

---

## ⚙️ Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React.js, Material UI (MUI), React Router |
| Backend    | Node.js, Express.js                   |
| Database   | MongoDB (Atlas for production)        |
| Auth       | JWT (JSON Web Tokens) + bcryptjs      |
| Upload     | Multer (local dev) / Cloudinary (prod)|
| Deployment | Vercel (frontend) + Render (backend)  |

---

## 🚀 Local Setup Instructions

### Prerequisites
- Node.js v18+ and npm
- MongoDB Atlas account (free tier works)

---

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/social-app.git
cd social-app
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

Fill in your `.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/social-app
JWT_SECRET=your_very_secret_key_here_make_it_long
```

Start the backend:
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Backend runs at: `http://localhost:5000`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Fill in your `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🌍 Deployment

### Frontend → Vercel
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Set **Root Directory** to `frontend`
4. Add environment variable: `REACT_APP_API_URL=https://your-render-app.onrender.com/api`
5. Deploy!

### Backend → Render
1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL)
7. Deploy!

### Database → MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a database user
3. Whitelist IP `0.0.0.0/0` (for Render)
4. Copy the connection string into `MONGO_URI`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | ❌ |
| POST | `/api/auth/login` | Login + get token | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

### Posts
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/posts?page=1&limit=10` | Get paginated feed | ❌ |
| POST | `/api/posts` | Create a post (text + image) | ✅ |
| PUT | `/api/posts/:id/like` | Toggle like | ✅ |
| POST | `/api/posts/:id/comment` | Add comment | ✅ |
| DELETE | `/api/posts/:id` | Delete own post | ✅ |

---

## ✨ Features

- ✅ Signup / Login with email & password (JWT auth)
- ✅ Create posts with text and/or images
- ✅ Public feed showing all users' posts
- ✅ Like / Unlike posts (instant optimistic UI update)
- ✅ Comment on posts (real-time update)
- ✅ Delete your own posts
- ✅ Infinite scroll pagination
- ✅ Responsive design (mobile + desktop)
- ✅ Clean MUI-based UI inspired by TaskPlanet Social Feed

---

## 🗄️ MongoDB Collections

Only **2 collections** are used:
1. **`users`** — Stores user accounts (username, email, hashed password)
2. **`posts`** — Stores posts (content, imageUrl, likes[], comments[])

---

## 📦 Dependencies

### Backend
- `express` — Web framework
- `mongoose` — MongoDB ODM
- `bcryptjs` — Password hashing
- `jsonwebtoken` — JWT auth
- `multer` — File upload handling
- `cors` — Cross-Origin Resource Sharing
- `dotenv` — Environment variables

### Frontend
- `react` + `react-dom` — UI library
- `react-router-dom` — Client-side routing
- `@mui/material` + `@mui/icons-material` — UI components
- `axios` — HTTP client
- `react-toastify` — Toast notifications
- `timeago.js` — Relative time formatting
