# AI Nutrition Tracker - Frontend

A modern, responsive web application for tracking daily nutrition with AI-powered recommendations.

## Features

- **User Authentication**: Firebase Authentication integration
- **Real-time Dashboard**: Live nutrition tracking with progress bars
- **Meal Logging**: Add meals from database or custom entries
- **AI Recommendations**: Smart food suggestions based on remaining macros
- **Weekly Analytics**: View nutrition trends and patterns
- **Goal Management**: Set and update daily nutrition goals
- **Alerts & Notifications**: Real-time alerts for nutrition milestones
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Project Structure

```
frontend/
├── index.html                  # Main HTML page
├── assets/
│   ├── css/
│   │   └── styles.css         # All CSS styles (modern & responsive)
│   └── js/
│       ├── firebase-config.js # Firebase configuration
│       └── app.js             # Main application logic
└── README.md                  # This file
```

## Installation

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase project with Authentication enabled

### Setup Steps

1. **Clone/Navigate to project**
```bash
cd frontend
```

2. **Configure Firebase**
   - Go to https://console.firebase.google.com
   - Create a new project or use existing
   - Enable Email/Password Authentication
   - Copy your Firebase config

3. **Update Firebase Configuration**
   - Open `assets/js/firebase-config.js`
   - Replace placeholder values with your Firebase credentials:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

4. **Serve the Application**
   - Option 1: Using Python
     ```bash
     python -m http.server 8000
     # Or Python 3
     python3 -m http.server 8000
     ```
   - Option 2: Using Node.js (http-server)
     ```bash
     npx http-server
     ```
   - Option 3: Using VS Code Live Server extension

5. **Access the App**
   - Open browser to `http://localhost:8000` (or your configured port)

## Pages & Features

### Login/Signup
- Email/password authentication
- New user account creation
- Session management

### Dashboard
- Today's macro tracking (Calories, Protein, Carbs, Fats)
- Progress bars for each macro
- Remaining intake display
- Today's meals log
- AI suggestions
- Real-time alerts

### Add Meal
- **Food Database**: Pre-populated food options with macros
- **Custom Meal**: Manual entry with detailed nutrition info
- Meal type categorization (breakfast, lunch, dinner, snack)
- Quick food selection

### Insights
- Weekly nutrition summary
- Average daily intake
- Trend analysis and patterns
- Daily history view
- Nutrition pattern detection

### Settings
- Edit daily goals
- View account information
- Logout functionality

## Architecture

### Frontend Stack
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with variables and flexbox/grid
- **Vanilla JavaScript**: No dependencies required
- **Firebase SDK**: Authentication

### API Integration
- RESTful API calls to Flask backend
- Bearer token authentication
- JSON request/response format

### Data Flow

```
User Login/Signup → Firebase Auth → Get ID Token
                                  ↓
                        Backend API Authentication
                                  ↓
                        Load User Goals & Data
                                  ↓
                        Display Dashboard
                                  ↓
                    User adds meal → API call
                                  ↓
                    Update dashboard display
                                  ↓
                        Load AI recommendations
```

## API Endpoints Used

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - User login
- `GET /api/auth/user-info` - Get user info

### Goals
- `POST /api/goals/set` - Set daily goals
- `GET /api/goals/get` - Get goals
- `PUT /api/goals/update` - Update goals

### Meals
- `POST /api/meals/add` - Add meal
- `GET /api/meals/daily/<date>` - Get meals for date
- `DELETE /api/meals/delete/<date>/<meal_id>` - Delete meal

### Recommendations
- `GET /api/recommendations/today` - Today's recommendations
- `GET /api/recommendations/weekly-trends` - Weekly analysis
- `GET /api/recommendations/food-database` - Food database

### Summary
- `GET /api/summary/today` - Today's summary
- `GET /api/summary/weekly` - Weekly summary

## UI Components

### Cards
- **Macro Cards**: Display calorie and macro tracking with progress
- **Suggestion Cards**: AI-powered food recommendations
- **Meal Items**: List of logged meals with delete option
- **Statistics Cards**: Summary statistics and insights

### Forms
- **Goal Setting**: Set daily nutrition targets
- **Meal Entry**: Add custom meals or from database
- **Authentication**: Login and signup forms

### Modals
- Goals setup modal
- Food database selector
- Custom meal entry form

### Notifications
- Toast notifications for actions
- Alert section for health notifications
- Loading spinner during API calls

## Styling & Responsive Design

### Colors
- Primary: Indigo (#6366f1)
- Success: Green (#10b981)
- Danger: Red (#ef4444)
- Warning: Amber (#f59e0b)

### Responsive Breakpoints
- Desktop: Full layout (1200px+)
- Tablet: Grid adjustments (768px-1200px)
- Mobile: Single column (< 768px)

### Accessibility
- Semantic HTML
- Proper form labels
- ARIA attributes where needed
- Keyboard navigation support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Configuration

### Backend URL
Update `API_BASE_URL` in `assets/js/app.js` if backend is on different address:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

### Firebase Configuration
Update `assets/js/firebase-config.js` with your Firebase project credentials.

## Development Tips

### Adding New Features
1. Update HTML structure in `index.html`
2. Add CSS styles in `assets/css/styles.css`
3. Add JavaScript logic in `assets/js/app.js`

### Testing
- Use browser DevTools (F12) to inspect elements
- Check console for JavaScript errors
- Verify API calls in Network tab
- Use Firebase Authentication emulator for testing

### Debugging
- Enable console logging in app.js functions
- Use browser DevTools breakpoints
- Check Firebase authentication state
- Verify backend is running and accessible

## Performance Optimization

- Lazy loading for insights data
- Debounced API calls
- Cached user data in memory
- Efficient DOM updates
- CSS animations for smooth UX

## Security Notes

- Firebase handles authentication securely
- ID tokens stored in Firebase SDK (not localStorage)
- All API calls require authentication
- CORS configured for localhost development
- No sensitive data in client-side code

## Known Limitations

- Frontend only connects to backend via API
- No offline functionality
- Requires backend server to be running
- Firebase project must be properly configured

## Future Enhancements

- Progressive Web App (PWA) support
- Offline data sync
- Charts and graphs for analytics
- Image-based food recognition
- Barcode scanner integration
- Export nutrition reports
- Dark mode support
- Multi-language support

## Troubleshooting

### "Cannot fetch from API"
- Verify backend is running on port 5000
- Check CORS configuration
- Ensure Firebase credentials are correct

### "Login fails"
- Verify Firebase project is active
- Check authentication methods are enabled
- Clear browser cache and cookies

### "Meals not showing"
- Verify goals are set first
- Check date format (YYYY-MM-DD)
- Ensure token is valid and not expired

## License

MIT License

## Support

For issues or questions, refer to the project documentation or check backend README.
