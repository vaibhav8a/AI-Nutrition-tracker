// ============================================
// Global Variables
// ============================================

const API_BASE_URL = 'http://localhost:5001/api';
let currentUser = null;
let currentToken = null;
let userGoals = null;
let todayDate = new Date().toISOString().split('T')[0];
let foodDatabase = []; // Store CSV food data

// ============================================
// Authentication Functions
// ============================================

// Utility function to ensure auth is ready
async function ensureAuthReady() {
    let attempts = 0;
    console.log('🔍 Checking if Firebase auth is ready...');

    while ((auth === null || typeof auth === 'undefined') && attempts < 50) {
        console.log(`⏳ Attempt ${attempts + 1}/50: Firebase auth not ready yet...`);
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (auth === null || typeof auth === 'undefined') {
        console.error('❌ Firebase auth is still null after 50 attempts!');
        console.error('🔍 Current auth value:', auth);
        console.error('🔍 Firebase object exists?', typeof firebase !== 'undefined');
        throw new Error('Firebase auth failed to initialize after 5 seconds');
    }

    console.log('✅ Firebase auth is ready!');
    return auth;
}

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
        // Ensure auth is ready
        const authInstance = await ensureAuthReady();

        // Create user in Firebase
        const userCredential = await authInstance.createUserWithEmailAndPassword(email, password);
        currentUser = userCredential.user;

        // Get ID token
        currentToken = await currentUser.getIdToken();

        showAuthMessage('Account created successfully! Logging in...', 'success');

        // Immediately hide auth and show goals modal
        console.log('🏠 Immediately hiding auth and showing goals modal...');
        showAuthContainer(false);
        showGoalsModal();
        showLoading(false);
    } catch (error) {
        showAuthMessage(error.message, 'error');
        showLoading(false);
    }
}

async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    showLoading(true);

    try {
        // Ensure auth is ready
        const authInstance = await ensureAuthReady();

        console.log('🔐 Attempting to sign in with:', email);
        const userCredential = await authInstance.signInWithEmailAndPassword(email, password);
        currentUser = userCredential.user;
        currentToken = await currentUser.getIdToken();

        console.log('✅ Sign in successful:', currentUser.email);
        showAuthMessage('Logged in successfully!', 'success');

        // Immediately hide auth and show app - don't wait
        console.log('🏠 Immediately hiding auth and showing dashboard...');
        showAuthContainer(false);
        showPage('dashboard');
        showLoading(false);

        // Load user data in background
        loadUserData().catch(error => {
            console.error('❌ Error loading user data:', error);
            showToast('Error loading user data: ' + error.message, 'error');
        });
    } catch (error) {
        console.error('❌ Login error:', error.message);
        showAuthMessage(error.message, 'error');
        showLoading(false);
    }
}

async function logout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            const authInstance = await ensureAuthReady();
            await authInstance.signOut();
            currentUser = null;
            currentToken = null;
            userGoals = null;
            showAuthContainer(true);
            showPage('dashboard');
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
    try {
        console.log('📥 Loading user data...');
        console.log('🔑 Current token:', currentToken ? 'Present ✅' : 'Missing ❌');
        showLoading(true);

        // Check if goals are set
        const goalsUrl = `${API_BASE_URL}/goals/get`;
        console.log('🌐 Fetching goals from:', goalsUrl);

        const goalsResponse = await fetch(goalsUrl, {
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Goals response status:', goalsResponse.status);
        console.log('📊 Goals response headers:', Object.fromEntries(goalsResponse.headers.entries()));

        if (goalsResponse.ok) {
            const data = await goalsResponse.json();
            console.log('✅ Goals data received:', data);
            userGoals = data.goals;
            console.log('✅ Goals loaded:', userGoals);

            // Load today's summary
            console.log('📥 Loading today summary...');
            await loadTodaysSummary();

            // Load recommendations
            console.log('📥 Loading recommendations...');
            await loadRecommendations();
        } else if (goalsResponse.status === 404) {
            console.log('📋 No goals set yet (404), showing modal');
            // Goals not set, show modal
            setTimeout(() => {
                console.log('🔔 Showing goals modal');
                showGoalsModal();
            }, 800);
        } else {
            const errorText = await goalsResponse.text();
            console.error('❌ Goals endpoint error:', goalsResponse.status, errorText);
            throw new Error(`Failed to load goals: ${goalsResponse.status} - ${errorText}`);
        }

        // Update account email
        if (currentUser) {
            const accountEmailEl = document.getElementById('accountEmail');
            if (accountEmailEl) {
                accountEmailEl.textContent = `Email: ${currentUser.email}`;
                console.log('📧 Updated email display');
            }
        }

        // Update date display
        const dateDisplayEl = document.getElementById('dateDisplay');
        if (dateDisplayEl) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            dateDisplayEl.textContent = new Date().toLocaleDateString('en-US', options);
            console.log('📅 Updated date display');
        }
    } catch (error) {
        console.error('❌ Error loading user data:', error.message);
        console.error('❌ Error details:', error);
        showToast('Error loading user data: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function handleSetGoals(event) {
    event.preventDefault();

    console.log('⚙️ handleSetGoals called');
    console.log('👤 Current user:', currentUser?.email, 'UID:', currentUser?.uid);

    const goals = {
        calories: parseInt(document.getElementById('goalCalories').value),
        protein: parseInt(document.getElementById('goalProtein').value),
        carbs: parseInt(document.getElementById('goalCarbs').value),
        fats: parseInt(document.getElementById('goalFats').value)
    };

    console.log('🎯 Goals to save:', goals);
    console.log('🔑 Token present:', currentToken ? 'Yes ✅' : 'No ❌');

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

        console.log('📊 Response status:', response.status);

        if (response.ok) {
            userGoals = goals;
            console.log('✅ Goals saved to userGoals variable:', userGoals);
            closeGoalsModal();
            await loadTodaysSummary();
            showToast('Goals saved successfully!', 'success');
        } else {
            const error = await response.json();
            console.error('❌ Error response:', error);
            showToast(error.error, 'error');
        }
    } catch (error) {
        console.error('❌ Exception in handleSetGoals:', error);
        showToast('Error saving goals: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function resetDailyGoals() {
    if (!confirm('Are you sure you want to reset your daily goals? This will clear all your progress today.')) {
        return;
    }

    console.log('🔄 Resetting daily goals...');
    showLoading(true);

    try {
        // Reset goals to default values
        const defaultGoals = {
            calories: 2000,
            protein: 150,
            carbs: 250,
            fats: 65
        };

        const response = await fetch(`${API_BASE_URL}/goals/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify(defaultGoals)
        });

        if (response.ok) {
            userGoals = defaultGoals;
            console.log('✅ Goals reset to default:', userGoals);

            // Refresh the dashboard
            await loadTodaysSummary();
            await loadRecommendations();

            // Update the form in case user opens goals modal
            document.getElementById('goalCalories').value = defaultGoals.calories;
            document.getElementById('goalProtein').value = defaultGoals.protein;
            document.getElementById('goalCarbs').value = defaultGoals.carbs;
            document.getElementById('goalFats').value = defaultGoals.fats;

            showToast('Daily goals reset to defaults!', 'success');
        } else {
            const error = await response.json();
            console.error('❌ Error resetting goals:', error);
            showToast('Error resetting goals: ' + error.error, 'error');
        }
    } catch (error) {
        console.error('❌ Exception in resetDailyGoals:', error);
        showToast('Error resetting goals: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ============================================
// Meal Management Functions
// ============================================

async function handleAddMeal(event) {
    event.preventDefault();

    // Guard: Ensure the form is being submitted only once
    if (event.target._isSubmitting) {
        console.warn('⚠️ Form submission already in progress, ignoring duplicate');
        return;
    }
    event.target._isSubmitting = true;

    console.log('🍽️ handleAddMeal called');
    console.log('👤 Current user:', currentUser?.email);

    const meal = {
        food_name: document.getElementById('mealName').value,
        calories: parseFloat(document.getElementById('mealCalories').value),
        protein: parseFloat(document.getElementById('mealProtein').value),
        carbs: parseFloat(document.getElementById('mealCarbs').value),
        fats: parseFloat(document.getElementById('mealFats').value),
        meal_type: document.getElementById('mealType').value
    };

    console.log('🍽️ Meal data:', meal);

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

        console.log('🍽️ Response status:', response.status);

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
            console.error('❌ Error response:', error);
            showToast(error.error, 'error');
        }
    } catch (error) {
        console.error('❌ Exception in handleAddMeal:', error);
        showToast('Error adding meal: ' + error.message, 'error');
    } finally {
        event.target._isSubmitting = false;
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
        console.log('📊 Loading today summary...');
        const response = await fetch(`${API_BASE_URL}/summary/today`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        console.log('📊 Summary response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Summary data:', data);
            if (!data || typeof data !== 'object') {
                console.error('❌ Invalid summary data:', data);
            }
            updateMacroDisplay(data);
            updateMealsList(data);
        } else if (response.status === 400) {
            console.log('⚠️ Goals not set yet - showing placeholder');
            // Goals not set - just show empty state
            const mealsList = document.getElementById('mealsList');
            if (mealsList) {
                mealsList.innerHTML = '<p class="empty-state">No meals logged yet</p>';
            } else {
                console.error('❌ mealsList element not found in DOM');
            }
        } else {
            const errorText = await response.text();
            console.error('❌ Summary error:', response.status, errorText);
        }
    } catch (error) {
        console.error('❌ Error loading summary:', error.message);
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
        console.log('💡 Loading recommendations...');
        const response = await fetch(`${API_BASE_URL}/recommendations/today`, {
            headers: { 'Authorization': `Bearer ${currentToken}` }
        });

        console.log('💡 Recommendations response status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Recommendations data:', data);
            updateAlerts(data.alerts);
            updateSuggestions(data.suggestions);
        } else if (response.status === 400) {
            console.log('⚠️ Goals not set - skipping recommendations');
            // Goals not set - just clear the suggestions
            const alertsSection = document.getElementById('alertsSection');
            if (alertsSection) alertsSection.style.display = 'none';
            const suggestionsList = document.getElementById('suggestionsList');
            if (suggestionsList) suggestionsList.innerHTML = '';
        } else {
            console.error('❌ Recommendations error:', response.status);
        }
    } catch (error) {
        console.error('❌ Error loading recommendations:', error);
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

async function loadFoodDatabase() {
    try {
        console.log('📦 Loading food database from CSV...');
        const response = await fetch('./assets/data/foods.csv');
        const csvText = await response.text();

        // Parse CSV
        const lines = csvText.trim().split('\n');
        const header = lines[0].split(',');

        foodDatabase = lines.slice(1).map(line => {
            const values = line.split(',');
            return {
                food_name: values[0].trim(),
                calories: parseFloat(values[1]),
                protein: parseFloat(values[2]),
                carbs: parseFloat(values[3]),
                fats: parseFloat(values[4])
            };
        });

        console.log(`✅ Loaded ${foodDatabase.length} foods from database`);
        console.log('📦 Food database sample:', foodDatabase.slice(0, 3));
    } catch (error) {
        console.error('❌ Error loading food database:', error);
    }
}

async function showFoodSuggestions() {
    console.log('🔥 Showing food suggestions...');

    if (foodDatabase.length === 0) {
        showToast('Food database not loaded yet', 'error');
        return;
    }

    const modal = document.getElementById('foodSuggestionsModal');
    if (!modal) {
        console.error('❌ foodSuggestionsModal not found in DOM');
        return;
    }

    // Sort: High-protein foods first
    const sorted = [...foodDatabase].sort((a, b) => b.protein - a.protein);

    // Display foods
    const foodList = document.getElementById('foodSuggestionsList');
    if (!foodList) {
        console.error('❌ foodSuggestionsList not found in DOM');
        return;
    }

    foodList.innerHTML = sorted.map((food, index) => {
        const isHighProtein = food.protein > 10;
        return `
            <div class="food-suggestion-card ${isHighProtein ? 'high-protein' : ''}">
                <div class="food-suggestion-info">
                    <h4>${food.food_name}</h4>
                    <div class="food-suggestion-macros">
                        <span class="macro-item">🔥 ${Math.round(food.calories)} cal</span>
                        <span class="macro-item ${isHighProtein ? 'protein-highlight' : ''}">🥚 ${food.protein}g protein</span>
                        <span class="macro-item">🌾 ${food.carbs}g carbs</span>
                        <span class="macro-item">🧈 ${food.fats}g fats</span>
                    </div>
                </div>
                <button class="btn-add-food" onclick="addFoodFromSuggestions('${food.food_name.replace(/'/g, "\\'")}', ${food.calories}, ${food.protein}, ${food.carbs}, ${food.fats})">
                    Add
                </button>
            </div>
        `;
    }).join('');

    modal.classList.add('active');
}

function addFoodFromSuggestions(name, calories, protein, carbs, fats) {
    console.log('➕ Adding food from suggestions:', name);

    document.getElementById('mealName').value = name;
    document.getElementById('mealCalories').value = calories;
    document.getElementById('mealProtein').value = protein;
    document.getElementById('mealCarbs').value = carbs;
    document.getElementById('mealFats').value = fats;

    closeFoodSuggestionsModal();
    document.getElementById('customMealForm').style.display = 'block';

    showToast(`${name} added to form!`, 'success');
}

function closeFoodSuggestionsModal() {
    const modal = document.getElementById('foodSuggestionsModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function filterFoodSuggestions(searchTerm) {
    console.log('🔍 Filtering foods by:', searchTerm);

    if (foodDatabase.length === 0) {
        console.warn('⚠️ Food database is empty');
        return;
    }

    // Filter foods
    const filtered = foodDatabase.filter(food =>
        food.food_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort: High-protein first
    const sorted = filtered.sort((a, b) => b.protein - a.protein);

    // Display
    const foodList = document.getElementById('foodSuggestionsList');
    if (foodList) {
        foodList.innerHTML = sorted.map(food => {
            const isHighProtein = food.protein > 10;
            return `
                <div class="food-suggestion-card ${isHighProtein ? 'high-protein' : ''}">
                    <div class="food-suggestion-info">
                        <h4>${food.food_name}</h4>
                        <div class="food-suggestion-macros">
                            <span class="macro-item">🔥 ${Math.round(food.calories)} cal</span>
                            <span class="macro-item ${isHighProtein ? 'protein-highlight' : ''}">🥚 ${food.protein}g protein</span>
                            <span class="macro-item">🌾 ${food.carbs}g carbs</span>
                            <span class="macro-item">🧈 ${food.fats}g fats</span>
                        </div>
                    </div>
                    <button class="btn-add-food" onclick="addFoodFromSuggestions('${food.food_name.replace(/'/g, "\\'")}', ${food.calories}, ${food.protein}, ${food.carbs}, ${food.fats})">
                        Add
                    </button>
                </div>
            `;
        }).join('');

        if (sorted.length === 0) {
            foodList.innerHTML = '<p class="empty-state">No foods found matching your search</p>';
        }
    }
}

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

function clearAllUserData() {
    console.log('🧹 CLEARING ALL USER DATA AND UI');

    // Clear global variables
    currentUser = null;
    currentToken = null;
    userGoals = null;

    // Clear all form inputs
    document.getElementById('goalCalories').value = '';
    document.getElementById('goalProtein').value = '';
    document.getElementById('goalCarbs').value = '';
    document.getElementById('goalFats').value = '';

    document.getElementById('mealName').value = '';
    document.getElementById('mealCalories').value = '';
    document.getElementById('mealProtein').value = '';
    document.getElementById('mealCarbs').value = '';
    document.getElementById('mealFats').value = '';
    document.getElementById('mealType').value = 'snack';

    // Clear lists and summaries
    const mealsList = document.getElementById('mealsList');
    if (mealsList) mealsList.innerHTML = '<p class="empty-state">No meals logged yet</p>';

    // Clear macro displays
    document.getElementById('caloriesFill').style.width = '0%';
    document.getElementById('proteinFill').style.width = '0%';
    document.getElementById('carbsFill').style.width = '0%';
    document.getElementById('fatsFill').style.width = '0%';

    document.getElementById('caloriesConsumed').textContent = '0';
    document.getElementById('proteinConsumed').textContent = '0';
    document.getElementById('carbsConsumed').textContent = '0';
    document.getElementById('fatsConsumed').textContent = '0';

    document.getElementById('caloriesRemaining').textContent = '0kcal remaining';
    document.getElementById('proteinRemaining').textContent = '0g remaining';
    document.getElementById('carbsRemaining').textContent = '0g remaining';
    document.getElementById('fatsRemaining').textContent = '0g remaining';

    // Clear recommendations
    const alertsList = document.getElementById('alertsList');
    if (alertsList) alertsList.innerHTML = '';
    const suggestionsList = document.getElementById('suggestionsList');
    if (suggestionsList) suggestionsList.innerHTML = '';

    console.log('✅ All user data cleared');
}

function showPage(pageName) {
    console.log('📄 showPage called with:', pageName);
    // Hide all pages
    const allPages = document.querySelectorAll('.page');
    console.log('📄 Found pages:', allPages.length);
    allPages.forEach(page => page.classList.remove('active'));

    // Show selected page
    const pageElement = document.getElementById(pageName + 'Page');
    console.log('📄 Looking for element:', pageName + 'Page');
    console.log('📄 Found page element:', pageElement);

    if (pageElement) {
        pageElement.classList.add('active');
        console.log('✅ Page activated:', pageName, '- SHOULD BE VISIBLE NOW');
    } else {
        console.error('❌ Page not found in DOM:', pageName + 'Page');
    }

    // ...existing code...
}

function showAuthContainer(show) {
    console.log('🔐 showAuthContainer called with:', show);
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');
    const navbar = document.querySelector('.navbar');

    console.log('🔐 authContainer element:', authContainer);
    console.log('🔐 appContainer element:', appContainer);

    if (show) {
        console.log('🔐 Adding .active to authContainer');
        authContainer.classList.add('active');
        appContainer.classList.remove('active');
        if (navbar) navbar.style.display = 'none';
        console.log('✅ Showing auth container');
    } else {
        console.log('🔐 Removing .active from authContainer');
        authContainer.classList.remove('active');
        console.log('🔐 Adding .active to appContainer');
        appContainer.classList.add('active');
        if (navbar) navbar.style.display = 'flex';
        console.log('✅ Showing app container - SHOULD BE VISIBLE NOW');
    }
}

function showGoalsModal() {
    document.getElementById('goalsModal').classList.add('active');
}

function closeGoalsModal() {
    document.getElementById('goalsModal').classList.remove('active');
}

function setGoals() {
    console.log('🎯 setGoals called');
    console.log('👤 Current user:', currentUser?.email);
    console.log('📊 userGoals:', userGoals);

    if (userGoals) {
        console.log('📝 Pre-filling form with existing goals:', userGoals);
        document.getElementById('goalCalories').value = userGoals.calories;
        document.getElementById('goalProtein').value = userGoals.protein;
        document.getElementById('goalCarbs').value = userGoals.carbs;
        document.getElementById('goalFats').value = userGoals.fats;
    } else {
        console.log('✨ No goals found - using defaults');
        // Use default values if no goals exist
        document.getElementById('goalCalories').value = 2000;
        document.getElementById('goalProtein').value = 150;
        document.getElementById('goalCarbs').value = 250;
        document.getElementById('goalFats').value = 65;
    }
    showGoalsModal();
}

function openGoalsModal() {
    console.log('📋 openGoalsModal called');
    console.log('👤 Current user:', currentUser?.email);
    console.log('🎯 userGoals:', userGoals);

    if (userGoals) {
        console.log('📝 Pre-filling form with existing goals:', userGoals);
        document.getElementById('goalCalories').value = userGoals.calories;
        document.getElementById('goalProtein').value = userGoals.protein;
        document.getElementById('goalCarbs').value = userGoals.carbs;
        document.getElementById('goalFats').value = userGoals.fats;
    } else {
        console.log('✨ No goals found - clearing form for new user');
        // Clear form if no goals exist
        document.getElementById('goalCalories').value = '';
        document.getElementById('goalProtein').value = '';
        document.getElementById('goalCarbs').value = '';
        document.getElementById('goalFats').value = '';
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

function initializeApp() {
    console.log('🚀 initializeApp called, auth value:', auth);
    if (auth === null || typeof auth === 'undefined') {
        console.log('⏳ Firebase auth not ready, retrying in 100ms...');
        setTimeout(initializeApp, 100);
        return;
    }

    console.log('✅ Firebase auth is ready, setting up listener');

    auth.onAuthStateChanged(async (user) => {
        console.log('🔄 Auth state changed, user:', user ? user.email : 'null');

        if (user) {
            console.log('👤 User logged in:', user.email);
            console.log('🆔 User UID:', user.uid);

            // Check if this is a NEW user (different from previous currentUser)
            if (currentUser && currentUser.uid !== user.uid) {
                console.log('🔄 USER CHANGED DETECTED! Clearing old user data...');
                clearAllUserData();
            }

            currentUser = user;

            try {
                currentToken = await user.getIdToken();
                console.log('🔑 Got ID token, length:', currentToken.length);
            } catch (error) {
                console.error('❌ Error getting ID token:', error);
                showToast('Error getting authentication token', 'error');
                return;
            }

            // Show app container first
            console.log('🖥️ Showing app container');
            showAuthContainer(false);

            // Show dashboard
            console.log('📊 Showing dashboard page');
            showPage('dashboard');

            try {
                console.log('📥 Loading user data after login...');
                await loadUserData();
                console.log('✅ User data loaded successfully');
            } catch (error) {
                console.error('❌ Error loading user data:', error);
                // Don't block the UI - user can still interact
                showToast('Error loading user data: ' + error.message, 'error');
            }
        } else {
            console.log('🔓 User logged out or not authenticated');
            clearAllUserData();

            // Show auth container
            console.log('🔐 Showing auth container');
            showAuthContainer(true);
        }
    });
}


// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM Content Loaded, initializing app...');

    // Load food database first
    loadFoodDatabase();

    // Initialize Firebase auth listener
    initializeApp();

    console.log('✅ App initialization complete');
});
