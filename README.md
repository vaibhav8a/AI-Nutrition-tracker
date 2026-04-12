# AI Nutrition Tracker - Quick Start

## 🎯 Quick Setup (5 minutes)

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Firebase credentials
python run.py
```

### 2. Frontend Setup
Open a new terminal:
```bash
cd frontend
python3 -m http.server 8000
# or: npx http-server
```

### 3. Access App
Visit: `http://localhost:8000`

---

## 🔑 Firebase Setup Checklist

- [ ] Created Firebase project
- [ ] Generated service account key → `serviceAccountKey.json`
- [ ] Enabled Firestore Database
- [ ] Enabled Email/Password Authentication
- [ ] Updated `.env` with project ID
- [ ] Updated `firebase-config.js` with web config

---

## 📱 Features at a Glance

✅ **User Authentication** - Firebase email/password  
✅ **Daily Goals Setup** - Calories, Protein, Carbs, Fats  
✅ **Meal Tracking** - Log meals with macro breakdown  
✅ **Live Dashboard** - Real-time progress tracking  
✅ **AI Recommendations** - Smart food suggestions  
✅ **Weekly Analytics** - Trend analysis & patterns  
✅ **Beautiful UI** - Modern, responsive design  

---

## 🆘 Need Help?

See `SETUP_GUIDE.md` for detailed instructions and troubleshooting.
