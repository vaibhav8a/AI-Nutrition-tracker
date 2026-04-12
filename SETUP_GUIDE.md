# AI Nutrition Tracker - Complete Setup Guide

## 🎯 Project Overview

The **AI Nutrition Tracker** is a full-stack web application that helps users track their daily nutrition intake with AI-powered recommendations. It features Firebase authentication, real-time progress tracking, and intelligent meal suggestions based on remaining macros.

### Tech Stack
- **Backend**: Flask (Python)
- **Frontend**: HTML/CSS/JavaScript (Vanilla)
- **Authentication**: Firebase
- **Database**: Firebase Firestore
- **AI**: Rule-based recommendation engine

---

## 📋 Prerequisites

Before starting, ensure you have:

1. **Python 3.8+** - Download from [python.org](https://www.python.org/)
2. **Node.js/npm** - Download from [nodejs.org](https://nodejs.org/) (optional, for frontend server)
3. **Firebase Account** - Create at [console.firebase.google.com](https://console.firebase.google.com)
4. **Git** - For version control (optional)
5. **Text Editor** - VS Code recommended

### Verify Installation
```bash
python --version
pip --version
```

---

## 🔧 Backend Setup (Flask)

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Create Virtual Environment
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Firebase

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Create Project"
   - Follow the setup wizard
   - Enable Firestore Database and Authentication

2. **Generate Service Account Key**
   - In Firebase Console, go to Settings ⚙️ → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `serviceAccountKey.json` in the backend folder

3. **Create `.env` File**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` with Your Firebase Credentials**
   ```
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_SERVICE_ACCOUNT_JSON=./serviceAccountKey.json
   FLASK_ENV=development
   FLASK_DEBUG=True
   FLASK_PORT=5000
   SECRET_KEY=your_secret_key_here
   ```

### Step 5: Run Backend Server
```bash
python run.py
```

**Expected Output:**
```
Firebase initialized successfully!
 * Running on http://0.0.0.0:5000
```

Backend is now running at `http://localhost:5000`

---

## 🎨 Frontend Setup (HTML/CSS/JS)

### Step 1: Navigate to Frontend Directory
```bash
cd ../frontend
```

### Step 2: Configure Firebase (Client-Side)

1. **Get Firebase Web Config**
   - In Firebase Console, go to Settings ⚙️ → General
   - Scroll to "Your apps" section
   - Click on your web app (or create if needed)
   - Copy the Firebase config object

2. **Update Frontend Configuration**
   - Open `assets/js/firebase-config.js`
   - Replace the placeholder values:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY_HERE",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your_project_id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

### Step 3: Enable Firebase Authentication

In Firebase Console:
1. Go to Authentication section
2. Click "Sign-in method"
3. Enable "Email/Password"
4. Save changes

### Step 4: Run Frontend Server

**Option 1: Python HTTP Server**
```bash
python -m http.server 8000
# or
python3 -m http.server 8000
```

**Option 2: Node.js HTTP Server**
```bash
npx http-server
```

**Option 3: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html`
- Select "Open with Live Server"

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:8000
```

---

## 🚀 First Steps in the Application

### 1. Create an Account
- Click "Sign Up" on the login page
- Enter email and password
- Click "Sign Up"

### 2. Set Your Daily Goals
- After signup, you'll see a goals setup modal
- Set your daily targets:
  - **Calories**: 2000 (adjust based on your goals)
  - **Protein**: 150g
  - **Carbs**: 250g
  - **Fats**: 65g
- Click "Save Goals"

### 3. Add Your First Meal
- Click "Add Meal" in navigation
- Choose between:
  - **Food Database**: Pre-populated foods with macros
  - **Custom Meal**: Enter food details manually
- Select a food or fill in details
- Click "Add Meal"

### 4. View Your Dashboard
- Click "Dashboard" to see today's progress
- Check macro totals and remaining intake
- See AI recommendations based on your needs

### 5. Explore Insights
- Click "Insights" to see weekly trends
- View average daily intake
- Discover nutrition patterns
- See daily history

---

## 📁 Project Structure

```
AI Nutrition tracker/
├── backend/
│   ├── app/
│   │   ├── __init__.py                 # Flask app factory
│   │   ├── routes/                     # API endpoints
│   │   │   ├── auth.py                # Authentication
│   │   │   ├── goals.py               # Goals management
│   │   │   ├── meals.py               # Meal logging
│   │   │   ├── recommendations.py     # AI suggestions
│   │   │   └── summary.py             # Dashboard data
│   │   ├── models/                     # Data models
│   │   │   ├── user_goals.py
│   │   │   └── meal.py
│   │   ├── services/                   # Business logic
│   │   │   └── ai_recommendations.py  # Recommendation engine
│   │   └── utils/                      # Utilities
│   │       ├── firebase_config.py
│   │       └── decorators.py
│   ├── run.py                          # Entry point
│   ├── requirements.txt                # Python dependencies
│   ├── .env.example                    # Env template
│   └── README.md                       # Backend docs
│
├── frontend/
│   ├── index.html                      # Main page
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css             # All styles
│   │   └── js/
│   │       ├── firebase-config.js     # Firebase setup
│   │       └── app.js                 # Main app logic
│   └── README.md                       # Frontend docs
│
└── SETUP_GUIDE.md                      # This file
```

---

## 🔑 API Endpoints Reference

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-token` - Verify token
- `GET /api/auth/user-info` - Get user info

### Goals Management
- `POST /api/goals/set` - Set daily goals
- `GET /api/goals/get` - Get current goals
- `PUT /api/goals/update` - Update goals

### Meal Tracking
- `POST /api/meals/add` - Log new meal
- `GET /api/meals/daily/<date>` - Get meals for date
- `GET /api/meals/daily-totals/<date>` - Get daily totals
- `DELETE /api/meals/delete/<date>/<meal_id>` - Delete meal

### AI Recommendations
- `GET /api/recommendations/today` - Today's suggestions
- `GET /api/recommendations/daily/<date>` - Suggestions for date
- `GET /api/recommendations/weekly-trends` - Weekly analysis
- `GET /api/recommendations/food-database` - Food list (public)

### Summary/Dashboard
- `GET /api/summary/today` - Today's summary
- `GET /api/summary/date/<date>` - Summary for date
- `GET /api/summary/weekly` - Weekly summary

---

## 🧪 Testing the Application

### Test Signup & Login
```bash
# Create account with test email
Email: test@example.com
Password: TestPassword123!

# Login with same credentials
```

### Test Adding Meals
```bash
# Add from food database
- Navigate to "Add Meal"
- Click "📋 Food Database"
- Select any food (e.g., Chicken Breast)
- Click to add

# Add custom meal
- Click "✏️ Custom Meal"
- Fill in food details:
  - Name: Grilled Chicken
  - Calories: 250
  - Protein: 35g
  - Carbs: 0g
  - Fats: 10g
- Click "Add Meal"
```

### Test API with cURL
```bash
# Get today's summary (replace TOKEN with actual token)
curl -X GET http://localhost:5000/api/summary/today \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Add a meal
curl -X POST http://localhost:5000/api/meals/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "food_name": "Apple",
    "calories": 95,
    "protein": 0.5,
    "carbs": 25,
    "fats": 0.3,
    "meal_type": "snack"
  }'
```

---

## 🔍 Troubleshooting

### Backend Issues

**"ModuleNotFoundError: No module named 'flask'"**
```bash
# Install dependencies again
pip install -r requirements.txt
```

**"Firebase initialization error"**
- Ensure `serviceAccountKey.json` is in backend folder
- Check `.env` has correct `FIREBASE_SERVICE_ACCOUNT_JSON` path
- Verify Firebase project ID in `.env`

**"Port 5000 already in use"**
```bash
# Kill process using port 5000
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Frontend Issues

**"Cannot reach backend API"**
- Ensure backend is running on port 5000
- Check `API_BASE_URL` in `assets/js/app.js`
- Verify CORS is enabled in Flask

**"Firebase auth fails"**
- Check Firebase config in `assets/js/firebase-config.js`
- Ensure Email/Password is enabled in Firebase
- Clear browser cache and cookies

**"Blank page or console errors"**
- Open browser DevTools (F12)
- Check Console tab for errors
- Verify all scripts are loading
- Check Network tab for failed requests

---

## 🎓 How the AI Recommendation Engine Works

### Daily Recommendations
1. Gets user's daily goals
2. Calculates current intake
3. Computes remaining macros
4. Analyzes deficit percentages:
   - If protein < 50% of goal → suggest high-protein foods
   - If carbs < 50% of goal → suggest carb-rich foods
   - If fats < 50% of goal → suggest fatty foods
5. Returns personalized food suggestions

### Alerts System
- **Low Protein**: If protein < 50% of goal
- **Exceeded Calories**: If total > calorie goal
- **Near Limit**: If 85-100% of calories consumed
- **Goal Achievement**: If all macros ≥ 90% of goal

### Weekly Trends
- Collects data from past 7 days
- Calculates average daily intake
- Detects patterns:
  - Consistently low protein (<80% of goal)
  - Average calorie excess (>110% of goal)
- Provides actionable insights

---

## 📊 Database Schema

### Firestore Structure
```
users/
├── {uid}/
│   ├── email (string)
│   ├── created_at (timestamp)
│   ├── goals_set (boolean)
│   ├── goals/
│   │   └── daily/
│   │       ├── calories (number)
│   │       ├── protein (number)
│   │       ├── carbs (number)
│   │       ├── fats (number)
│   │       └── updated_at (timestamp)
│   └── meals/
│       └── {YYYY-MM-DD}/
│           └── entries/
│               ├── {doc_id}/
│               │   ├── food_name (string)
│               │   ├── calories (number)
│               │   ├── protein (number)
│               │   ├── carbs (number)
│               │   ├── fats (number)
│               │   ├── meal_type (string)
│               │   └── created_at (timestamp)
```

---

## 🔐 Security Best Practices

1. **Never commit sensitive files**
   - Add to `.gitignore`: `serviceAccountKey.json`, `.env`

2. **Secure Firebase Rules**
   - Users can only access their own data
   - Authentication required for all operations

3. **API Authentication**
   - All endpoints (except public) require Firebase ID token
   - Token verification on backend

4. **Environment Variables**
   - Keep credentials in `.env` file
   - Never hardcode sensitive data

---

## 🚀 Deployment

### Backend Deployment (Heroku/Vercel)
1. Push to GitHub repository
2. Connect repository to deployment platform
3. Set environment variables in platform settings
4. Deploy

### Frontend Deployment (GitHub Pages/Netlify)
1. Push frontend folder to GitHub
2. Enable GitHub Pages in repository settings
3. Or connect to Netlify and deploy

---

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Python Firestore Guide](https://firebase.google.com/docs/firestore/client/libraries#python)
- [Firebase Auth JS SDK](https://firebase.google.com/docs/auth/web/start)

---

## 📧 Support & Feedback

For issues or suggestions:
1. Check the troubleshooting section above
2. Review README files in backend/ and frontend/ folders
3. Check browser console and backend logs for errors

---

## 📝 License

MIT License - Feel free to use and modify

---

**Happy Tracking! 🥗**
