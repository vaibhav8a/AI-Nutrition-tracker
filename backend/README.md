# AI Nutrition Tracker - Backend

A comprehensive Flask-based backend for an AI-powered health and nutrition tracking system with Firebase authentication and recommendations engine.

## Features

- **Firebase Authentication**: Secure user login and signup
- **Daily Goals Management**: Users can set and update daily nutrition targets
- **Meal Tracking**: Log meals with macro breakdown
- **AI Recommendations**: Smart food suggestions based on remaining macros
- **Weekly Analytics**: Track nutrition patterns over time
- **Daily Summaries**: Real-time nutrition totals and progress tracking

## Project Structure

```
backend/
├── app/
│   ├── __init__.py                 # Flask app factory
│   ├── routes/
│   │   ├── auth.py                 # Authentication endpoints
│   │   ├── goals.py                # Goals management endpoints
│   │   ├── meals.py                # Meal logging endpoints
│   │   ├── recommendations.py      # AI recommendation endpoints
│   │   └── summary.py              # Dashboard summary endpoints
│   ├── models/
│   │   ├── user_goals.py           # UserGoals model
│   │   └── meal.py                 # Meal model
│   ├── services/
│   │   └── ai_recommendations.py   # Recommendation engine logic
│   └── utils/
│       ├── firebase_config.py      # Firebase initialization
│       └── decorators.py           # Custom decorators (auth)
├── run.py                          # Application entry point
├── requirements.txt                # Python dependencies
├── .env.example                    # Environment variables template
└── README.md                       # This file
```

## Installation

### Prerequisites
- Python 3.8+
- Firebase project with credentials
- pip (Python package manager)

### Setup Steps

1. **Clone/Navigate to project**
```bash
cd backend
```

2. **Create virtual environment**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Download service account key (JSON file)
   - Place it in the backend folder as `serviceAccountKey.json`

5. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your Firebase credentials
```

6. **Run the application**
```bash
python run.py
```

The backend will start at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-token` - Verify Firebase ID token
- `GET /api/auth/user-info` - Get current user info (requires auth)

### Goals
- `POST /api/goals/set` - Set daily nutrition goals (requires auth)
- `GET /api/goals/get` - Get user's goals (requires auth)
- `PUT /api/goals/update` - Update goals (requires auth)

### Meals
- `POST /api/meals/add` - Add a meal entry (requires auth)
- `GET /api/meals/daily/<date>` - Get meals for specific date (requires auth)
- `GET /api/meals/daily-totals/<date>` - Get daily macro totals (requires auth)
- `DELETE /api/meals/delete/<date>/<meal_id>` - Delete a meal (requires auth)

### Recommendations
- `GET /api/recommendations/daily/<date>` - Get recommendations for date (requires auth)
- `GET /api/recommendations/today` - Get today's recommendations (requires auth)
- `GET /api/recommendations/weekly-trends` - Get weekly analysis (requires auth)
- `GET /api/recommendations/food-database` - Get food database (public)

### Summary
- `GET /api/summary/today` - Get today's summary (requires auth)
- `GET /api/summary/date/<date>` - Get summary for date (requires auth)
- `GET /api/summary/weekly` - Get weekly summary (requires auth)

## Request Examples

### Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Set Goals
```bash
curl -X POST http://localhost:5000/api/goals/set \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase_id_token>" \
  -d '{
    "calories": 2000,
    "protein": 150,
    "carbs": 250,
    "fats": 65
  }'
```

### Add Meal
```bash
curl -X POST http://localhost:5000/api/meals/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <firebase_id_token>" \
  -d '{
    "food_name": "Grilled Chicken",
    "calories": 250,
    "protein": 35,
    "carbs": 0,
    "fats": 10,
    "meal_type": "lunch"
  }'
```

### Get Today's Summary
```bash
curl -X GET http://localhost:5000/api/summary/today \
  -H "Authorization: Bearer <firebase_id_token>"
```

## Authentication

All protected endpoints require Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

The token is obtained from the frontend after user login via Firebase SDK.

## Database Schema

### Firestore Collections

```
users/
├── {uid}
│   ├── email
│   ├── created_at
│   ├── goals_set (boolean)
│   ├── goals/
│   │   └── daily
│   │       ├── calories
│   │       ├── protein
│   │       ├── carbs
│   │       ├── fats
│   │       └── updated_at
│   └── meals/
│       └── {YYYY-MM-DD}
│           └── entries/
│               ├── {doc_id}
│               │   ├── food_name
│               │   ├── calories
│               │   ├── protein
│               │   ├── carbs
│               │   ├── fats
│               │   ├── meal_type
│               │   └── created_at
```

## AI Recommendation Engine

The system includes a smart recommendation engine that:

1. **Daily Recommendations**: Analyzes remaining macros and suggests foods
2. **Alerts**: Notifies users about:
   - Low protein intake
   - Exceeded calorie goals
   - Near calorie limits
   - Goal achievements

3. **Weekly Trends**: Identifies patterns like:
   - Consistently low protein
   - Average calorie excess
   - Nutrition balance trends

4. **Food Database**: Pre-loaded with 20+ common foods in categories:
   - High Protein
   - High Carbs
   - High Fats
   - Balanced Options

## Configuration

Key environment variables in `.env`:

```
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_SERVICE_ACCOUNT_JSON=./serviceAccountKey.json

SECRET_KEY=your_secret_key
```

## Error Handling

All endpoints return JSON with appropriate HTTP status codes:

- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **404**: Not Found
- **500**: Server Error

Example error response:
```json
{
  "error": "User goals not set"
}
```

## Future Enhancements

- OpenAI API integration for advanced recommendations
- Barcode scanner integration
- Food image recognition
- Weekly health report generation
- Notification system (email/SMS)
- Advanced analytics and charts

## License

MIT License

## Support

For issues or questions, please refer to the project documentation or create an issue.
