# NutriSync - Pure MERN Stack + Bootstrap

Converted from TypeScript + Tailwind + Gemini → **JavaScript + Bootstrap + Groq AI + MongoDB**

---

## Tech Stack

| Layer | Original | Converted |
|---|---|---|
| Frontend | React + TypeScript + Tailwind | React + JavaScript + Bootstrap 5 |
| AI | Google Gemini API | Groq API (Llama 3.3 70B) |
| Database | better-sqlite3 | MongoDB + Mongoose |
| Server | single server.ts | Express.js + separate routes |

---

## Setup

### 1. Get Free Groq API Key
👉 https://console.groq.com  
Sign up → Create API Key → Copy it

### 2. Start MongoDB
Make sure MongoDB is running locally:
```bash
mongod
```
Or use MongoDB Atlas (free cloud): https://cloud.mongodb.com

### 3. Server Setup
```bash
cd server
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/nutrisync
GROQ_API_KEY=your_groq_api_key_here
```

```bash
npm install
npm run dev
```

### 4. Client Setup
```bash
cd client
npm install
npm run dev
```

### 5. Open App
Go to: http://localhost:5173

---

## Project Structure

```
nutrisync-mern/
├── server/
│   ├── server.js              # Express app + MongoDB connect
│   ├── .env.example
│   ├── routes/
│   │   ├── userRoutes.js      # POST /api/user/onboard, GET /api/user/profile
│   │   └── aiRoutes.js        # POST /api/ai/diet-plan, POST /api/ai/analyze-food
│   └── models/
│       └── User.js            # Mongoose user schema
│
└── client/
    ├── vite.config.js         # Proxy /api → localhost:5000
    ├── index.html
    └── src/
        ├── main.jsx           # Bootstrap imports
        ├── App.jsx            # Main app with routing
        ├── index.css          # Custom dark theme CSS
        └── components/
            ├── Onboarding.jsx
            ├── Dashboard.jsx
            ├── FoodScan.jsx
            ├── DietPlan.jsx
            ├── MealTracker.jsx
            └── ReportModal.jsx
```

---

## Features
- ✅ Neural onboarding with BMI calculator
- ✅ Dashboard with vitals, macros, energy ring, chart
- ✅ Food scan via image → Groq Vision AI analysis
- ✅ AI diet plan generation using Groq Llama 3.3
- ✅ Meal history tracker
- ✅ Bluetooth watch simulator (vitals simulation)
- ✅ PDF report export
- ✅ Profile editing
- ✅ Hosteller mode with mess menu support
- ✅ Data persistence (MongoDB + localStorage)
