# 🥗 AI Nutrition Tracker

A full-stack web application for tracking daily nutrition intake with AI-powered recommendations. Built with vanilla JavaScript frontend and Flask backend, powered by Firebase for authentication and Firestore for data storage.

![AI Nutrition Tracker](Screenshot%202026-04-12%20at%201.25.11%20PM.png)

## ✨ Features

### 🔐 Authentication
- **Secure Sign Up & Login** - Firebase-based authentication with email verification
- **User Session Management** - Persistent login with JWT tokens
- **Data Isolation** - Each user's data is completely isolated and secure

### 📊 Dashboard
- **Real-time Macro Tracking** - Track calories, protein, carbs, and fats
- **Daily Summary** - View all meals logged for the day
- **Progress Bars** - Visual representation of macro consumption vs. goals
- **Quick Add Meal** - Easily add meals from a form or food database

### 🍽️ Meal Management
- **Add Meals** - Log meals manually or from the 223-food database
- **Food Database** - Search through 223+ pre-loaded foods with nutritional data
- **Delete Meals** - Remove meals if logged incorrectly
- **Meal Types** - Categorize meals as breakfast, lunch, dinner, or snack

### 🎯 Goals Management
- **Set Personal Goals** - Define daily calorie and macro targets
- **Edit Goals** - Modify goals at any time
- **Reset to Defaults** - Quickly reset to recommended values
- **Goal Tracking** - Monitor progress against your personal goals

### 💡 AI-Powered Recommendations
- **Smart Alerts** - Get notified when exceeding or falling short on macros
- **Personalized Suggestions** - AI recommends foods to help meet your goals
- **Weekly Insights** - View trends and patterns in your nutrition over time
- **Eating Patterns** - AI detects your eating habits and patterns

### 📈 Analytics & Insights
- **Weekly Trends** - Average daily consumption across macros
- **Daily History** - View detailed breakdown for each day of the week
- **Pattern Detection** - Identify your nutrition habits and tendencies
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## 🛠️ Tech Stack

### Frontend
- **HTML5, CSS3, Vanilla JavaScript** - No heavy frameworks, fast and lightweight
- **Firebase SDK** - Real-time authentication
- **CSV Parser** - Efficient food database loading
- **Responsive Design** - Mobile-first approach

### Backend
- **Flask 2.3.3** - Lightweight Python web framework
- **Firebase Admin SDK** - Server-side Firebase operations
- **Python 3** - Backend logic and AI recommendations
- **CORS Enabled** - Seamless frontend-backend communication

### Database & Auth
- **Firebase Authentication** - Secure user authentication
- **Firestore** - Real-time NoSQL database
- **JWT Tokens** - Bearer token authentication for API calls

## 📋 Project Structure

```
AI-Nutrition-tracker/
├── frontend/
│   ├── index.html                 # Main HTML file
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css        # Responsive styling (1,189 lines)
│   │   ├── js/
│   │   │   ├── app.js            # Main app logic (1,097 lines)
│   │   │   └── firebase-config.js # Firebase configuration
│   │   └── data/
│   │       └── foods.csv         # 223 foods database
│   └── README.md
├── backend/
│   ├── run.py                    # Flask entry point
│   ├── requirements.txt          # Python dependencies
│   ├── Procfile                  # Deployment configuration
│   ├── serviceAccountKey.json    # Firebase credentials (in .gitignore)
│   └── app/
│       ├── __init__.py           # Flask app factory
│       ├── models/
│       │   ├── meal.py           # Meal data model
│       │   └── user_goals.py     # User goals model
│       ├── routes/
│       │   ├── auth.py           # Authentication endpoints
│       │   ├── goals.py          # Goals management endpoints
│       │   ├── meals.py          # Meal management endpoints
│       │   ├── recommendations.py # AI recommendations
│       │   └── summary.py        # Daily summary endpoints
│       ├── services/
│       │   └── ai_recommendations.py # AI logic
│       └── utils/
│           ├── firebase_config.py    # Firebase setup
│           └── decorators.py         # Auth decorators
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js (optional, for frontend development)
- Firebase account & project
- Google Cloud credentials

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/vaibhav8a/AI-Nutrition-tracker.git
cd AI-Nutrition-tracker
```

### 2️⃣ Backend Setup

1. **Create Python Virtual Environment**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing one
   - Generate a service account key (Project Settings → Service Accounts)
   - Save as `backend/serviceAccountKey.json`

4. **Create `.env` File** (in backend folder)
   ```env
   FLASK_PORT=5001
   FLASK_DEBUG=True
   FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
   ```

5. **Start Backend Server**
   ```bash
   python run.py
   ```
   Backend will run on `http://localhost:5001`

### 3️⃣ Frontend Setup

1. **Navigate to Frontend**
   ```bash
   cd ../frontend
   ```

2. **Configure Firebase** (if needed)
   - Edit `assets/js/firebase-config.js`
   - Add your Firebase project credentials

3. **Start Frontend Server**
   ```bash
   python3 -m http.server 8000
   ```
   Frontend will run on `http://localhost:8000`

4. **Open in Browser**
   - Navigate to `http://localhost:8000`
   - Create an account or login

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Goals
- `GET /api/goals/get` - Get user's goals
- `POST /api/goals/set` - Set/update goals
- `POST /api/goals/reset` - Reset to defaults

### Meals
- `POST /api/meals/add` - Add a meal
- `GET /api/meals/daily/{date}` - Get meals for a specific date
- `DELETE /api/meals/delete/{date}/{mealId}` - Delete a meal

### Summary
- `GET /api/summary/today` - Get today's nutrition summary

### Recommendations
- `GET /api/recommendations/today` - Get daily recommendations
- `GET /api/recommendations/weekly-trends` - Get weekly insights

## 🍔 Food Database

The app comes with **223 pre-loaded foods** organized by category:
- **Proteins** - Chicken, beef, fish, eggs, tofu, etc.
- **Carbs** - Rice, pasta, bread, potatoes, oats, etc.
- **Fats** - Olive oil, nuts, seeds, avocado, etc.
- **Vegetables** - Broccoli, carrots, spinach, tomatoes, etc.
- **Fruits** - Apples, bananas, berries, oranges, etc.
- **Dairy** - Milk, yogurt, cheese, etc.

Each food includes:
- Calories per serving
- Protein content (g)
- Carbs content (g)
- Fats content (g)

## 🎯 How to Use

### 1. Create Account
- Go to `http://localhost:8000`
- Click "Sign Up"
- Enter email and password
- Account created and automatically logged in

### 2. Set Your Goals
- A modal will appear asking for daily nutrition goals
- Enter target calories, protein, carbs, and fats
- Click "Save Goals"

### 3. Add Your First Meal
- Go to "Add Meal" page
- Choose to:
  - **Search Food Database** - Find from 223+ foods
  - **Custom Meal** - Enter custom nutritional values
- Select meal type (breakfast, lunch, dinner, snack)
- Click "Add Meal"

### 4. View Dashboard
- See today's nutrition summary
- Track progress towards your goals
- View all meals logged today

### 5. Check Insights
- Go to "Insights" page
- See weekly averages
- View eating patterns detected by AI
- Review daily history

### 6. Manage Settings
- Go to "Settings" page
- Edit or reset your daily goals
- View your account information

## 🚀 Deployment

### Deploy Backend to Railway
1. Push code to GitHub
2. Connect Railway to your GitHub repo
3. Set environment variables (Firebase credentials)
4. Railway auto-detects `Procfile` and starts the app

### Deploy Frontend to Vercel
1. Push code to GitHub
2. Connect Vercel to your GitHub repo
3. Set build output to `frontend` directory
4. Update `API_BASE_URL` in `app.js` to your Railway backend URL

[See detailed deployment guide in project documentation]

## 🔒 Security

- **Firebase Authentication** - Industry-standard auth
- **JWT Tokens** - Secure API communication
- **CORS Enabled** - Only allow frontend requests
- **Environment Variables** - Sensitive data in .env files
- **Git Ignore** - `serviceAccountKey.json` never committed

## 📱 Responsive Design

The app is fully responsive:
- **Desktop** (900px+) - 3-column layout
- **Tablet** (768px-899px) - 2-column layout
- **Mobile** (320px-767px) - 1-column stacked layout

## 🐛 Troubleshooting

### "API connection failed"
- Ensure backend is running: `python run.py` from `/backend`
- Check `API_BASE_URL` in `app.js` matches backend URL
- Verify CORS is enabled in backend

### "Firebase not initialized"
- Check `firebase-config.js` has correct credentials
- Ensure Firebase SDK script is loaded (check browser console)
- Verify Firebase project exists and is active

### "Goals modal not closing"
- Clear browser cache and reload
- Check browser console for JavaScript errors
- Ensure modal classes are correctly applied

### "Food database not loading"
- Verify `foods.csv` exists in `frontend/assets/data/`
- Check browser Network tab for 404 errors
- Ensure CSV is properly formatted

## 📊 Food Database Format

`foods.csv` format:
```
Food Name,Calories,Protein,Carbs,Fats
Chicken Breast,165,31,0,3.6
Brown Rice,111,2.6,23,0.9
...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Vaibhav Srivastava**
- GitHub: [@vaibhav8a](https://github.com/vaibhav8a)
- Project: [AI-Nutrition-tracker](https://github.com/vaibhav8a/AI-Nutrition-tracker)

## 🙏 Acknowledgments

- Firebase for authentication and database
- Flask for backend framework
- Community feedback and contributions

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review troubleshooting section above

---

**Happy tracking! 🥗💪**
