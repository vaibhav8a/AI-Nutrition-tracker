# Deployment Guide - AI Nutrition Tracker

## 🚀 Production Deployment

### Prerequisites
- GitHub account
- Cloud hosting account (Heroku, Railway, or similar)
- Domain name (optional)

---

## 📦 Backend Deployment (Flask)

### Option 1: Heroku Deployment

1. **Install Heroku CLI**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Procfile**
   ```bash
   # In backend folder
   echo "web: python run.py" > Procfile
   ```

3. **Create runtime.txt**
   ```bash
   echo "python-3.11.0" > runtime.txt
   ```

4. **Prepare for Deployment**
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial commit"
   ```

5. **Deploy to Heroku**
   ```bash
   heroku login
   heroku create your-app-name
   
   # Set environment variables
   heroku config:set FIREBASE_PROJECT_ID=your_project_id
   heroku config:set FIREBASE_SERVICE_ACCOUNT_JSON='{ ... }'
   heroku config:set FLASK_ENV=production
   
   git push heroku main
   ```

### Option 2: Railway.app Deployment

1. **Connect GitHub Repository**
   - Go to railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository

2. **Set Environment Variables**
   - In Railway dashboard
   - Add all variables from `.env`

3. **Deploy**
   - Railway auto-deploys on git push

### Option 3: AWS/Azure

1. **Create EC2/VM Instance**
2. **Install Python and dependencies**
3. **Set up Nginx reverse proxy**
4. **Configure SSL certificate**
5. **Enable firewall rules**

---

## 🌐 Frontend Deployment

### Option 1: GitHub Pages

1. **Create GitHub Repository**
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/repo.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings
   - Scroll to "Pages"
   - Select branch and folder
   - Save

3. **Access Your Site**
   ```
   https://username.github.io/repo-name
   ```

### Option 2: Netlify Deployment

1. **Connect to Netlify**
   - Go to netlify.com
   - Click "New site from Git"
   - Select GitHub repository

2. **Configure Build Settings**
   - Build command: (leave empty)
   - Publish directory: `frontend/`

3. **Set Environment Variables**
   - Add Firebase config as environment variables
   - Or update `firebase-config.js` before deployment

4. **Deploy**
   - Netlify auto-deploys on git push

### Option 3: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel
   ```

3. **Follow prompts**

---

## 🔒 Production Considerations

### Security Checklist
- [ ] Remove debug mode: `FLASK_DEBUG=False`
- [ ] Set secure `SECRET_KEY`
- [ ] Update Firebase security rules
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Add input validation
- [ ] Use environment variables for all secrets

### Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      match /goals/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
      
      match /meals/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

### CORS Configuration (Production)

```python
# In app/__init__.py
CORS(app, origins=[
    "https://yourdomain.com",
    "https://www.yourdomain.com"
])
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy Backend
      run: |
        # Backend deployment commands
        
    - name: Deploy Frontend
      run: |
        # Frontend deployment commands
```

---

## 📊 Monitoring & Analytics

### Set Up Logging
```python
# In backend
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

### Monitor Application
- Use Firebase Console for database monitoring
- Set up error tracking with Sentry
- Monitor API performance
- Track user engagement

---

## 🎯 Performance Optimization

### Backend
- Enable gzip compression
- Implement caching
- Optimize database queries
- Use connection pooling

### Frontend
- Minify CSS and JavaScript
- Compress images
- Lazy load content
- Use CDN for static files

---

## 📱 Domain & DNS

1. **Buy Domain**
   - GoDaddy, Namecheap, Route53

2. **Configure DNS**
   - Point to your hosting service
   - Add SSL certificate

3. **Update Configuration**
   - Update CORS origins
   - Update Firebase auth domains
   - Update redirect URLs

---

## 🆘 Troubleshooting Deployment

### Backend Issues

**"Module not found" error**
```bash
# Ensure requirements.txt is up to date
pip freeze > requirements.txt
```

**"Firebase authentication fails"**
- Verify service account JSON is properly formatted
- Check all environment variables are set
- Ensure Firebase project is active

### Frontend Issues

**"API calls fail"**
- Check backend URL is correct
- Verify CORS is enabled
- Check API_BASE_URL in app.js

**"Firebase authentication fails"**
- Verify Firebase config is correct
- Check auth domain is properly set
- Ensure authentication methods are enabled

---

## 🚀 Scaling Strategy

### Phase 1: MVP (Current)
- Single server backend
- Static frontend hosting
- Firebase Firestore

### Phase 2: Growth
- Load balancing
- Database optimization
- Caching layer (Redis)
- CDN for frontend

### Phase 3: Scale
- Microservices architecture
- Database sharding
- Advanced analytics
- Machine learning models

---

## 📋 Pre-Deployment Checklist

Backend:
- [ ] Remove all debug prints
- [ ] Test all API endpoints
- [ ] Update environment variables
- [ ] Verify Firebase configuration
- [ ] Add error handling
- [ ] Set up logging
- [ ] Test authentication flow

Frontend:
- [ ] Update API_BASE_URL
- [ ] Update Firebase config
- [ ] Test all pages
- [ ] Optimize images
- [ ] Minify CSS/JS
- [ ] Test on mobile

---

## 📞 Post-Deployment Support

### Monitoring
- Set up uptime monitoring
- Configure alerts
- Monitor error rates
- Track user metrics

### Maintenance
- Regular backups
- Security updates
- Performance optimization
- User support

---

**Happy deploying!** 🎉
