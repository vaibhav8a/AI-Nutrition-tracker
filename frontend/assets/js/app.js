// ============================================
// Global Variables
// ============================================

const API_BASE_URL = 'http://localhost:5001/api';
let currentUser = null;
let currentToken = null;
let userGoals = null;
let todayDate = new Date().toISOString().split('T')[0];

// ============================================
// Authentication Functions
// ============================================

async function handleSignup(event) {
    event.preventDefault();

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

    if (password !== passwordConfirm) {
        showAuthMessage('Passwords do not match', 'error');
        return;
    }

    showLoading(true);

    try {
        // Create user in Firebase
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        currentUser = userCredential.user;

        // Get ID token
        currentToken = await currentUser.getIdToken();

        showAuthMessage('Account created successfully! Logging in...', 'success');

        setTimeout(() => {
            showAuthContainer(false);
            showGoalsModal();
        }, 1000);
    } catch (error) {
        showAuthMessage(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    showLoading(true);

    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        currentToken = await currentUser.getIdToken();

        showAuthMessage('Logged in successfully!', 'success');

        setTimeout(() => {
            showAuthContainer(false);
            loadUserData();
        }, 500);
    } catch (error) {
        showAuthMessage(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await auth.signOut();
            currentUser = null;
            currentToken = null;
            showAuthContainer(true);
            showToast('Logged out successfully', 'success');
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
}

function switchTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tab + 'Tab').classList.add('active');

    // Clear form
    document.querySelectorAll('.auth-tab input').forEach(input => input.value = '');
}

function showAuthMessage(message, type) {
    const authMessage = document.getElementById('authMessage');
    authMessage.textContent = message;
    authMessage.className = 'auth-message ' + type;
}

// ============================================
// User Data Functions
// ============================================

async function loadUserData() {
    showLoading(true);

    try {
        // Check if goals are set
        const goalsResponse = await fetch(`${API_BASE_URL}/goals/get`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (goalsResponse.ok) {
            const data = await goalsResponse.json();
            userGoals = data.goals;
        } else if (goalsResponse.status === 404) {
            // Goals not set, show modal
            showGoalsModal();
            return;
        }

        // Load today's summary
        await loadTodaysSummary();

        // Load recommendations
        await loadRecommendations();

        // Update account email
        document.getElementById('accountEmail').textContent = `Email: ${currentUser.email}`;

        // Update date display
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('dateDisplay').textContent = new Date().toLocaleDateString('en-US', options);
    } catch (error) {
        showToast('Error loading user data: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function handleSetGoals(event) {
    event.preventDefault();

    const goals = {
        calories: parseInt(document.getElementById('goalCalories').value),
        protein: parseInt(document.getElementById('goalProtein').value),
        carbs: parseInt(document.getElementById('goalCarbs').value),
        fats: parseInt(document.getElementById('goalFats').value)
    };

    showLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/goals/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(goals)
        });

        if (response.ok) {
            userGoals = goals;
            closeGoalsModal();
            await loadTodaysSummary();
            showToast('Goals saved successfully!', 'success');
        } else {
            const error = await response.json();
            showToast(error.error, 'error');
        }
    } catch (error) {
        showToast('Error saving goals: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ============================================
// Meal Management Functions
// ============================================

async function handleAddMeal(event) {
    event.preventDefault();

    const meal = {
        food_name: document.getElementById('mealName').value,
        calories: parseFloat(document.getElementById('mealCalories').value),
        protein: parseFloat(document.getElementById('mealProtein').value),
        carbs: parseFloat(document.getElementById('mealCarbs').value),
        fats: parseFloat(document.getElementById('mealFats').value),
        meal_type: document.getElementById('mealType').value
    };

    showLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/meals/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(meal)
        });

        if (response.ok) {
            // Clear form
            event.target.reset();
            document.getElementById('customMealForm').style.display = 'none';

            // Reload summary
            await loadTodaysSummary();
            await loadRecommendations();

            showToast('Meal added successfully!', 'success');
        } else {
            const error = await response.json();
            showToast(error.error, 'error');
        }
    } catch (error) {
        showToast('Error adding meal: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteMeal(mealId) {
    if (confirm('Are you sure you want to delete this meal?')) {
        showLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/meals/delete/${todayDate}/${mealId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${currentToken}` }
            });

            if (response.ok) {
                await loadTodaysSummary();
                await loadRecommendations();
                showToast('Meal deleted successfully!', 'success');
            } else {
                showToast('Error deleting meal', 'error');
            }
        } catch (error) {
            showToast('Error deleting meal: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }
}

// ============================================
// Dashboard Functions
// ============================================

async function loadTodaysSummary() {
    try {
        const response = await fetch(`${API_BASE_URL}/summary/today`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            updateMacroDisplay(data);
            updateMealsList(data);
        } else if (response.status === 400) {
            showToast('Please set your goals first', 'error');
        }
    } catch (error) {
        showToast('Error loading summary: ' + error.message, 'error');
    }
}

function updateMacroDisplay(data) {
    const { goals, totals, percentages, remaining } = data;

    // Update calories
    updateMacroCard('calories', totals.calories, goals.calories, percentages.calories, remaining.calories, 'kcal');

    // Update protein
    updateMacroCard('protein', totals.protein, goals.protein, percentages.protein, remaining.protein, 'g');

    // Update carbs
    updateMacroCard('carbs', totals.carbs, goals.carbs, percentages.carbs, remaining.carbs, 'g');

    // Update fats
    updateMacroCard('fats', totals.fats, goals.fats, percentages.fats, remaining.fats, 'g');
}

function updateMacroCard(macro, consumed, goal, percentage, remaining, unit) {
    const progressFill = document.getElementById(macro + 'Fill');
    const consumedEl = document.getElementById(macro + 'Consumed');
    const goalEl = document.getElementById(macro + 'Goal');
    const remainingEl = document.getElementById(macro + 'Remaining');

    progressFill.style.width = Math.min(percentage, 100) + '%';
    consumedEl.textContent = Math.round(consumed);
    goalEl.textContent = goal;
    remainingEl.textContent = Math.round(remaining) + unit + ' remaining';
}

function updateMealsList(data) {
    const mealsList = document.getElementById('mealsList');

    if (data.totals.meal_count === 0) {
        mealsList.innerHTML = '<p class="empty-state">No meals logged yet</p>';
        return;
    }

    // Fetch meals for today
    fetch(`${API_BASE_URL}/meals/daily/${todayDate}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
    })
        .then(response => response.json())
        .then(data => {
            mealsList.innerHTML = data.meals.map(meal => `
            <div class="meal-item">
                <div class="meal-info">
                    <h4>${meal.food_name}</h4>
                    <span class="meal-type">${meal.meal_type}</span>
                    <div class="meal-macros">
                        <span>🔥 ${Math.round(meal.calories)} cal</span>
                        <span>🥚 ${Math.round(meal.protein)}g protein</span>
                        <span>🌾 ${Math.round(meal.carbs)}g carbs</span>
                        <span>🧈 ${Math.round(meal.fats)}g fats</span>
                    </div>
                </div>
                <div class="meal-actions">
                    <button class="btn-delete" onclick="deleteMeal('${meal.id}')">Delete</button>
                </div>
            </div>
        `).join('');
        })
        .catch(error => showToast('Error loading meals: ' + error.message, 'error'));
}

// ============================================
// Recommendations Functions
// ============================================

async function loadRecommendations() {
    try {
        const response = await fetch(`${API_BASE_URL}/recommendations/today`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            updateAlerts(data.alerts);
            updateSuggestions(data.suggestions);
        }
    } catch (error) {
        console.error('Error loading recommendations:', error);
    }
}

function updateAlerts(alerts) {
    const alertsSection = document.getElementById('alertsSection');
    const alertsList = document.getElementById('alertsList');

    if (alerts.length === 0) {
        alertsSection.style.display = 'none';
        return;
    }

    alertsSection.style.display = 'block';
    alertsList.innerHTML = alerts.map(alert => `
        <div class="alert ${alert.type}">
            ${alert.message}
        </div>
    `).join('');
}

function updateSuggestions(suggestions) {
    const suggestionsList = document.getElementById('suggestionsList');

    suggestionsList.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-card">
            <h4>${suggestion.category.toUpperCase()}</h4>
            <p>${suggestion.message}</p>
            <div class="food-list">
                ${suggestion.foods.map(food => `
                    <div class="food-item">
                        <strong>${food.name}</strong>
                        <p class="food-macros">
                            <span>${food.calories} cal</span>
                            <span>${food.protein}g protein</span>
                            <span>${food.carbs}g carbs</span>
                            <span>${food.fats}g fats</span>
                        </p>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// ============================================
// Insights Functions
// ============================================

async function loadWeeklyInsights() {
    showLoading(true);

    try {
        const response = await fetch(`${API_BASE_URL}/recommendations/weekly-trends`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        if (response.ok) {
            const data = await response.json();

            if (data.message) {
                document.getElementById('avgCalories').textContent = '—';
                document.getElementById('avgProtein').textContent = '—';
                document.getElementById('avgCarbs').textContent = '—';
                document.getElementById('avgFats').textContent = '—';
            } else {
                document.getElementById('avgCalories').textContent = Math.round(data.averages.calories);
                document.getElementById('avgProtein').textContent = Math.round(data.averages.protein) + 'g';
                document.getElementById('avgCarbs').textContent = Math.round(data.averages.carbs) + 'g';
                document.getElementById('avgFats').textContent = Math.round(data.averages.fats) + 'g';

                // Update patterns
                const patternsList = document.getElementById('patternsList');
                if (data.patterns.length === 0) {
                    patternsList.innerHTML = '<p class="empty-state">No patterns detected yet</p>';
                } else {
                    patternsList.innerHTML = data.patterns.map(pattern => `
                        <div class="pattern-item">${pattern}</div>
                    `).join('');
                }

                // Update history
                const historyList = document.getElementById('historyList');
                historyList.innerHTML = data.daily_summary.map(day => `
                    <div class="history-item">
                        <span class="history-date">${day.date}</span>
                        <div class="history-stats">
                            <span>🔥 ${Math.round(day.calories)} cal</span>
                            <span>🥚 ${Math.round(day.protein)}g protein</span>
                            <span>🌾 ${Math.round(day.carbs)}g carbs</span>
                            <span>🧈 ${Math.round(day.fats)}g fats</span>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        showToast('Error loading insights: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ============================================
// Food Database Functions
// ============================================

async function showFoodDatabase() {
    try {
        const response = await fetch(`${API_BASE_URL}/recommendations/food-database`);
        const data = await response.json();

        const foodDatabaseList = document.getElementById('foodDatabaseList');
        const foodDatabase = data.food_database;

        foodDatabaseList.innerHTML = Object.keys(foodDatabase).map(category => `
            <div class="food-category">
                <h4>${category.replace('_', ' ').toUpperCase()}</h4>
                ${foodDatabase[category].map(food => `
                    <div class="food-option" onclick="addFoodFromDatabase(${JSON.stringify(food).replace(/"/g, '&quot;')})">
                        <h5>${food.name}</h5>
                        <p>${food.serving}</p>
                        <div class="food-macros">
                            <span>${food.calories} cal</span>
                            <span>${food.protein}g protein</span>
                            <span>${food.carbs}g carbs</span>
                            <span>${food.fats}g fats</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');

        document.getElementById('foodDatabaseModal').classList.add('active');
    } catch (error) {
        showToast('Error loading food database: ' + error.message, 'error');
    }
}

function addFoodFromDatabase(food) {
    document.getElementById('mealName').value = food.name;
    document.getElementById('mealCalories').value = food.calories;
    document.getElementById('mealProtein').value = food.protein;
    document.getElementById('mealCarbs').value = food.carbs;
    document.getElementById('mealFats').value = food.fats;

    closeFoodDatabaseModal();
    document.getElementById('customMealForm').style.display = 'block';
}

// ============================================
// UI Helper Functions
// ============================================

function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));

    // Show selected page
    document.getElementById(pageName + 'Page').classList.add('active');

    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');

    // Load specific data
    if (pageName === 'insights') {
        loadWeeklyInsights();
    }
}

function showAuthContainer(show) {
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');

    if (show) {
        authContainer.classList.add('active');
        appContainer.classList.remove('active');
        document.querySelector('.navbar').style.display = 'none';
    } else {
        authContainer.classList.remove('active');
        appContainer.classList.add('active');
        document.querySelector('.navbar').style.display = 'block';
    }
}

function showGoalsModal() {
    document.getElementById('goalsModal').style.display = 'flex';
}

function closeGoalsModal() {
    document.getElementById('goalsModal').style.display = 'none';
}

function openGoalsModal() {
    if (userGoals) {
        document.getElementById('goalCalories').value = userGoals.calories;
        document.getElementById('goalProtein').value = userGoals.protein;
        document.getElementById('goalCarbs').value = userGoals.carbs;
        document.getElementById('goalFats').value = userGoals.fats;
    }
    showGoalsModal();
}

function showCustomMeal() {
    document.getElementById('customMealForm').style.display = 'block';
}

function closeFoodDatabaseModal() {
    document.getElementById('foodDatabaseModal').classList.remove('active');
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.style.display = 'flex';
    } else {
        spinner.style.display = 'none';
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// Initialize App
// ============================================

auth.onAuthStateChanged(async (user) => {
    if (user) {
        currentUser = user;
        currentToken = await user.getIdToken();
        showAuthContainer(false);
        await loadUserData();
    } else {
        showAuthContainer(true);
        showPage('dashboard');
    }
});

// Load food database on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    document.getElementById('customMealForm').addEventListener('submit', handleAddMeal);
});
