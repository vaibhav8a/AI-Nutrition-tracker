# 🚀 Vercel Deployment Guide - AI Nutrition Tracker

## Overview
Your project consists of:
- **Frontend**: HTML/CSS/JS (Vercel-friendly ✅)
- **Backend**: Flask API (Needs alternative hosting)

---

## Option 1: Deploy Frontend to Vercel + Backend to Railway (RECOMMENDED)

### Step 1: Prepare Frontend for Vercel

#### 1.1 Create `vercel.json` in root directory
```json
{
  "version": 2,
  "public": false,
  "builds": [
    {
      "src": "frontend",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "frontend/index.html"
    }
  ]
}
```

#### 1.2 Create `.vercelignore` file
```
backend/
node_modules/
.git/
.env
serviceAccountKey.json
```

#### 1.3 Update API URLs
In `frontend/assets/js/app.js`, change:
```javascript
// OLD:
const API_BASE_URL = 'http://localhost:5001/api';

// NEW (replace with your Railway backend URL):
const API_BASE_URL = 'https://your-railway-backend.up.railway.app/api';
```

---

## Step 2: Deploy Backend to Railway

Railway is perfect for Flask apps and offers free tier!

### 2.1 Prepare Backend for Railway

Create `Procfile` in backend directory:
```
web: python run.py
```

Update `run.py` to use environment variables:
```python
if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    debug = os.getenv('FLASK_DEBUG', 'False') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug)
```

Create `railway.json` in project root:
```json
{
  "build": {
    "builder": "dockerfile"
  },
  "deploy": {
    "startCommand": "cd backend && python run.py",
    "restartPolicyMaxRetries": 5
  }
}
```

### 2.2 Sign Up & Deploy on Railway

1. Go to https://railway.app
2. Sign up with GitHub account
3. Create new project
4. Select "Deploy from GitHub repo"
5. Select your `AI-Nutrition-tracker` repository
6. Add environment variables:
   - `FLASK_ENV`: production
   - `FIREBASE_PROJECT_ID`: your-project-id
   - Upload `serviceAccountKey.json` as environment variable

### 2.3 Get Railway Backend URL

After deployment, Railway will give you a URL like:
```
https://your-railway-backend.up.railway.app
```

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Install Vercel CLI
```bash
npm install -g vercel
```

### 3.2 Deploy via CLI

```bash
cd /Users/vaibhavsrivastava/Documents/AI\ Nutrition\ tracker
vercel
```

Follow prompts:
- Link to GitHub repo: Yes
- Scope: Your GitHub username
- Project name: ai-nutrition-tracker
- Framework: Other
- Output directory: frontend

### 3.3 Set Environment Variables in Vercel

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://your-railway-backend.up.railway.app/api`

---

## Option 2: Deploy Everything to Vercel (Backend as Serverless Functions)

Vercel supports Python serverless functions! This is simpler.

### Setup:

1. Create `/api/` directory in root:
```
api/
  index.py
```

2. Move Flask code to serverless functions:
```python
# api/index.py
from flask import Flask, request, jsonify
from functools import wraps
import os

app = Flask(__name__)

# Your existing Flask code here...

@app.route('/api/goals/get', methods=['GET'])
def get_goals():
    # Your code
    pass

@app.route('/api/goals/set', methods=['POST'])
def set_goals():
    # Your code
    pass

# ... rest of your routes ...
```

3. Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/index.html"
    }
  ]
}
```

4. Update frontend API URL to relative path:
```javascript
const API_BASE_URL = '/api';
```

---

## STEP-BY-STEP DEPLOYMENT (Quickest Method)

### Method: Vercel Frontend + Railway Backend

**Time needed: 10-15 minutes**

#### Part 1: Prepare Code (5 minutes)

```bash
# 1. Update API URL in app.js
# Edit: frontend/assets/js/app.js
# Change: const API_BASE_URL = 'http://localhost:5001/api';
# To: const API_BASE_URL = 'https://your-railway-url/api';
```

#### Part 2: Deploy Backend to Railway (3 minutes)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Choose your repo
5. Add environment variables (Firebase config)
6. Click "Deploy"
7. Copy the generated URL

#### Part 3: Deploy Frontend to Vercel (5 minutes)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd /path/to/project
vercel
```

3. Follow the prompts and select "frontend" as output directory

---

## Environment Variables Needed

### For Railway (Backend):
```
PORT=5001
FLASK_ENV=production
FLASK_DEBUG=False
FIREBASE_PROJECT_ID=health-tracker-9b687
FIREBASE_PRIVATE_KEY=your-private-key-here
FIREBASE_CLIENT_EMAIL=your-email@iam.gserviceaccount.com
```

### For Vercel (Frontend):
```
VITE_API_URL=https://your-railway-backend.up.railway.app/api
```

---

## Common Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Update Flask `CORS` in backend:
```python
from flask_cors import CORS

CORS(app, origins=['https://your-vercel-frontend.vercel.app'])
```

### Issue 2: Firebase Auth Not Working
**Solution**: Add frontend URL to Firebase Console:
- Go to Firebase Console
- Settings → Authentication
- Add `https://your-vercel-frontend.vercel.app` to authorized domains

### Issue 3: 404 on Refresh
**Solution**: Add `vercel.json` routes config (included above)

### Issue 4: Backend Environment Variables Not Loading
**Solution**: Make sure to add ALL variables in Railway dashboard

---

## Testing Deployed App

1. Go to `https://your-frontend.vercel.app`
2. Try signing up
3. Check browser console for API errors
4. If 404, check Railway backend is running
5. If CORS error, update Firebase console

---

## Monitoring & Logs

### Vercel Logs:
```bash
vercel logs
```

### Railway Logs:
- Go to Railway dashboard
- Click your project
- View "Deployments" tab

---

## Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby (Free) | $0/month |
| Railway | Free tier | $0/month (first 500 hours) |
| Firebase | Spark (Free) | $0/month |
| **Total** | | **$0/month** |

---

## Next Steps

1. **Complete Step 1**: Update API URL
2. **Complete Step 2**: Deploy to Railway
3. **Complete Step 3**: Deploy to Vercel
4. **Test**: Sign up, add meal, verify it works
5. **Monitor**: Check logs for any errors

Good luck! 🚀
