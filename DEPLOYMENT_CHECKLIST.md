# ✅ Vercel Deployment Checklist

## Pre-Deployment (5 minutes)

- [ ] Update `frontend/assets/js/app.js` with backend URL
  ```javascript
  const API_BASE_URL = 'https://your-railway-backend.up.railway.app/api';
  ```

- [ ] Verify `vercel.json` exists in root
- [ ] Verify `.vercelignore` exists in root
- [ ] Verify `backend/Procfile` exists
- [ ] Commit and push changes to GitHub

---

## Backend Deployment (3-5 minutes)

### Railway Deployment:

1. **Sign Up**
   - Go to https://railway.app
   - Click "Start Project"
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Select `AI-Nutrition-tracker`

3. **Add Environment Variables**
   - Click "Add Variable"
   - Add these from your `.env` file:
     ```
     PORT=5001
     FLASK_ENV=production
     FLASK_DEBUG=False
     ```

4. **Deploy**
   - Railway auto-deploys from GitHub
   - Wait for "Deployed" status
   - Copy the Railway URL (e.g., `https://your-app.up.railway.app`)

5. **Copy Backend URL**
   - Go to "Settings"
   - Copy the Domain/URL
   - Update it in `frontend/assets/js/app.js`

---

## Frontend Deployment (5-10 minutes)

### Vercel Deployment:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd /Users/vaibhavsrivastava/Documents/AI\ Nutrition\ tracker
   vercel --prod
   ```

3. **Follow Prompts**
   - Scope: Your GitHub username
   - Project name: `ai-nutrition-tracker`
   - Framework: `Other`
   - Output directory: `frontend`

4. **Get Vercel URL**
   - After deployment, you'll see: `https://ai-nutrition-tracker.vercel.app`

---

## Post-Deployment Setup (5 minutes)

### Firebase Console Configuration:

1. Go to Firebase Console
2. Select your project
3. Go to Settings → Authentication
4. Add to "Authorized domains":
   - `your-vercel-frontend.vercel.app`
   - `localhost:8000` (for local testing)

5. Go to Firestore Settings
6. Verify it's set to "Production mode"

---

## Testing (5 minutes)

- [ ] Navigate to Vercel frontend URL
- [ ] Test Sign Up
- [ ] Test Sign In with existing account
- [ ] Test Add Meal
- [ ] Test Edit Goals
- [ ] Check browser console for errors
- [ ] Check Vercel logs: `vercel logs`
- [ ] Check Railway logs in dashboard

---

## If Something Goes Wrong

### 404 Errors:
- Check Vercel `vercel.json` has correct routes
- Verify `frontend` directory is set as output

### CORS Errors:
- Check Firebase authorized domains
- Check backend CORS configuration
- Verify backend URL in `app.js`

### Backend Not Responding:
- Check Railway deployment status
- Check Railway logs
- Verify environment variables in Railway

### Firebase Auth Not Working:
- Check Firebase authorized domains include Vercel URL
- Check Firebase API key is correct
- Check CORS headers in backend

---

## Environment Variables Reference

### Railway Backend:
```
PORT=5001
FLASK_ENV=production
FLASK_DEBUG=False
FIREBASE_PROJECT_ID=health-tracker-9b687
FIREBASE_PRIVATE_KEY=<from serviceAccountKey.json>
FIREBASE_CLIENT_EMAIL=<from serviceAccountKey.json>
FIREBASE_CLIENT_ID=<from serviceAccountKey.json>
```

### Vercel Frontend:
```
No secrets needed (handled by frontend code)
```

---

## Useful Commands

```bash
# View Vercel logs
vercel logs

# Check Vercel project status
vercel status

# Redeploy specific version
vercel --prod

# View environment variables
vercel env ls

# Add new environment variable
vercel env add API_URL
```

---

## Cost Summary

| Service | Tier | Cost |
|---------|------|------|
| Vercel | Hobby | Free |
| Railway | Free | Free (500 hrs/month) |
| Firebase | Spark | Free |
| **Total** | | **$0** |

---

## Success Indicators ✅

Your deployment is successful when:
1. ✅ Vercel frontend loads at `your-app.vercel.app`
2. ✅ Can sign up and create account
3. ✅ Can set daily goals
4. ✅ Can add meals
5. ✅ Dashboard shows macro tracking
6. ✅ Edit Goals button works
7. ✅ No console errors

---

## Support & Troubleshooting

Need help? Check:
1. Vercel docs: https://vercel.com/docs
2. Railway docs: https://docs.railway.app
3. Firebase docs: https://firebase.google.com/docs
4. Check browser console for errors
5. Check Vercel/Railway logs

Good luck! 🚀
