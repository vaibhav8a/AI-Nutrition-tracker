"""
AI-powered recommendation engine for food suggestions
"""
from datetime import datetime, timedelta
from app.models.meal import Meal
from app.models.user_goals import UserGoals

# Food database with macronutrient values (per 100g or standard serving)
FOOD_DATABASE = {
    'high_protein': [
        {'name': 'Chicken Breast', 'serving': '100g',
            'calories': 165, 'protein': 31, 'carbs': 0, 'fats': 3.6},
        {'name': 'Egg (1 large)', 'serving': '1 egg',
         'calories': 78, 'protein': 6, 'carbs': 0.6, 'fats': 5},
        {'name': 'Greek Yogurt', 'serving': '100g', 'calories': 59,
            'protein': 10, 'carbs': 3.3, 'fats': 0.4},
        {'name': 'Cottage Cheese', 'serving': '100g',
            'calories': 98, 'protein': 11, 'carbs': 3.4, 'fats': 5},
        {'name': 'Tuna (canned)', 'serving': '100g',
         'calories': 99, 'protein': 21, 'carbs': 0, 'fats': 1},
        {'name': 'Paneer', 'serving': '100g', 'calories': 265,
            'protein': 25, 'carbs': 1.2, 'fats': 17},
    ],
    'high_carbs': [
        {'name': 'Banana', 'serving': '1 medium', 'calories': 89,
            'protein': 1.1, 'carbs': 23, 'fats': 0.3},
        {'name': 'Oats', 'serving': '100g', 'calories': 389,
            'protein': 17, 'carbs': 66, 'fats': 7},
        {'name': 'Brown Rice', 'serving': '100g', 'calories': 111,
            'protein': 2.6, 'carbs': 23, 'fats': 0.9},
        {'name': 'Sweet Potato', 'serving': '100g', 'calories': 86,
            'protein': 1.6, 'carbs': 20, 'fats': 0.1},
        {'name': 'Whole Wheat Bread', 'serving': '1 slice',
            'calories': 100, 'protein': 4, 'carbs': 18, 'fats': 1},
    ],
    'high_fats': [
        {'name': 'Almonds',
            'serving': '28g (23 nuts)', 'calories': 161, 'protein': 6, 'carbs': 6, 'fats': 14},
        {'name': 'Olive Oil', 'serving': '1 tbsp', 'calories': 119,
            'protein': 0, 'carbs': 0, 'fats': 13.5},
        {'name': 'Salmon', 'serving': '100g', 'calories': 206,
            'protein': 22, 'carbs': 0, 'fats': 13},
        {'name': 'Avocado', 'serving': '1/2 fruit', 'calories': 120,
            'protein': 1.5, 'carbs': 6, 'fats': 11},
        {'name': 'Peanut Butter', 'serving': '2 tbsp',
            'calories': 190, 'protein': 8, 'carbs': 7, 'fats': 16},
    ],
    'balanced': [
        {'name': 'Grilled Chicken Salad', 'serving': '1 serving',
            'calories': 350, 'protein': 35, 'carbs': 20, 'fats': 8},
        {'name': 'Quinoa Bowl', 'serving': '1 bowl',
            'calories': 400, 'protein': 15, 'carbs': 60, 'fats': 8},
        {'name': 'Lentil Soup', 'serving': '1 cup',
            'calories': 230, 'protein': 18, 'carbs': 40, 'fats': 1},
        {'name': 'Tofu Stir-fry', 'serving': '1 serving',
            'calories': 300, 'protein': 20, 'carbs': 25, 'fats': 12},
    ]
}


class RecommendationEngine:
    """
    AI engine to analyze nutrition intake and provide personalized recommendations
    """

    @staticmethod
    def get_daily_recommendations(user_id, date_str=None):
        """
        Generate recommendations based on current daily intake

        Args:
            user_id (str): User's Firebase UID
            date_str (str): Date in 'YYYY-MM-DD' format (default: today)

        Returns:
            dict: Recommendations with suggested foods
        """
        if date_str is None:
            date_str = datetime.now().strftime('%Y-%m-%d')

        # Get user goals
        goals = UserGoals.get(user_id)
        if not goals:
            return {'error': 'User goals not set'}

        # Get daily totals
        totals = Meal.calculate_daily_totals(user_id, date_str)

        # Calculate remaining macros
        remaining = {
            'calories': goals['calories'] - totals['calories'],
            'protein': goals['protein'] - totals['protein'],
            'carbs': goals['carbs'] - totals['carbs'],
            'fats': goals['fats'] - totals['fats']
        }

        recommendations = {
            'date': date_str,
            'current_intake': totals,
            'goals': goals,
            'remaining': remaining,
            'suggestions': [],
            'alerts': []
        }

        # Generate suggestions based on remaining macros
        recommendations['suggestions'] = RecommendationEngine._generate_suggestions(
            remaining, goals)

        # Generate alerts for user
        recommendations['alerts'] = RecommendationEngine._generate_alerts(
            totals, goals)

        return recommendations

    @staticmethod
    def _generate_suggestions(remaining, goals):
        """
        Generate food suggestions based on remaining macros

        Args:
            remaining (dict): Remaining macros
            goals (dict): User's goals

        Returns:
            list: List of suggestions with foods
        """
        suggestions = []

        # Check protein deficit
        protein_percentage = (
            remaining['protein'] / goals['protein']) * 100 if goals['protein'] > 0 else 0
        if protein_percentage > 20:  # More than 20% of protein goal remaining
            suggestions.append({
                'category': 'protein',
                'message': f'You need {remaining["protein"]:.0f}g more protein!',
                'foods': FOOD_DATABASE['high_protein'][:3]  # Top 3 suggestions
            })

        # Check carbs deficit
        carbs_percentage = (
            remaining['carbs'] / goals['carbs']) * 100 if goals['carbs'] > 0 else 0
        if carbs_percentage > 20:
            suggestions.append({
                'category': 'carbs',
                'message': f'You need {remaining["carbs"]:.0f}g more carbs!',
                'foods': FOOD_DATABASE['high_carbs'][:3]
            })

        # Check fats deficit
        fats_percentage = (
            remaining['fats'] / goals['fats']) * 100 if goals['fats'] > 0 else 0
        if fats_percentage > 20:
            suggestions.append({
                'category': 'fats',
                'message': f'You need {remaining["fats"]:.0f}g more fats!',
                'foods': FOOD_DATABASE['high_fats'][:3]
            })

        # If all macros are relatively balanced, suggest balanced meals
        if not suggestions or len(suggestions) == 0:
            suggestions.append({
                'category': 'balanced',
                'message': 'Looking good! Here are some balanced options:',
                'foods': FOOD_DATABASE['balanced'][:3]
            })

        return suggestions

    @staticmethod
    def _generate_alerts(totals, goals):
        """
        Generate alerts for user about their nutrition

        Args:
            totals (dict): Current daily totals
            goals (dict): User's goals

        Returns:
            list: List of alerts
        """
        alerts = []

        # Protein alert
        protein_percentage = (
            totals['protein'] / goals['protein']) * 100 if goals['protein'] > 0 else 0
        if protein_percentage < 50:
            alerts.append({
                'type': 'warning',
                'message': f'⚠️ Low protein intake ({totals["protein"]:.0f}g / {goals["protein"]}g)',
                'severity': 'high' if protein_percentage < 25 else 'medium'
            })

        # Calorie alert
        if totals['calories'] > goals['calories']:
            excess = totals['calories'] - goals['calories']
            alerts.append({
                'type': 'warning',
                'message': f'⚠️ Exceeded calorie goal by {excess:.0f}kcal',
                'severity': 'medium'
            })

        # Calorie near limit
        calorie_percentage = (
            totals['calories'] / goals['calories']) * 100 if goals['calories'] > 0 else 0
        if 85 < calorie_percentage < 100:
            alerts.append({
                'type': 'info',
                'message': f'📊 Nearing calorie limit ({calorie_percentage:.0f}% consumed)',
                'severity': 'low'
            })

        # Goal achievement
        carbs_percentage = (
            totals['carbs'] / goals['carbs']) * 100 if goals['carbs'] > 0 else 0
        fats_percentage = (totals['fats'] / goals['fats']
                           ) * 100 if goals['fats'] > 0 else 0

        if totals['calories'] > 0 and (
            protein_percentage >= 90 and
            carbs_percentage >= 90 and
            fats_percentage >= 90
        ):
            alerts.append({
                'type': 'success',
                'message': '🎉 Excellent nutrition balance today!',
                'severity': 'low'
            })

        return alerts

    @staticmethod
    def analyze_weekly_trends(user_id, weeks=1):
        """
        Analyze nutrition patterns over the past weeks

        Args:
            user_id (str): User's Firebase UID
            weeks (int): Number of weeks to analyze

        Returns:
            dict: Weekly trend analysis
        """
        goals = UserGoals.get(user_id)
        if not goals:
            return {'error': 'User goals not set'}

        daily_summaries = []

        # Collect data for each day
        for i in range(weeks * 7):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            totals = Meal.calculate_daily_totals(user_id, date)

            if totals['meal_count'] > 0:  # Only include days with meals
                daily_summaries.append({
                    'date': date,
                    **totals
                })

        if not daily_summaries:
            return {'message': 'No data available for analysis'}

        # Calculate averages
        avg_calories = sum(d['calories']
                           for d in daily_summaries) / len(daily_summaries)
        avg_protein = sum(d['protein']
                          for d in daily_summaries) / len(daily_summaries)
        avg_carbs = sum(d['carbs']
                        for d in daily_summaries) / len(daily_summaries)
        avg_fats = sum(d['fats']
                       for d in daily_summaries) / len(daily_summaries)

        # Detect patterns
        patterns = []

        avg_protein_pct = (
            avg_protein / goals['protein']) * 100 if goals['protein'] > 0 else 0
        if avg_protein_pct < 80:
            patterns.append(
                f"🔍 Protein trend: Consistently low protein intake ({avg_protein_pct:.0f}% of goal)")

        avg_calories_pct = (
            avg_calories / goals['calories']) * 100 if goals['calories'] > 0 else 0
        if avg_calories_pct > 110:
            patterns.append(
                f"🔍 Calorie trend: Slightly exceeding goal on average ({avg_calories_pct:.0f}% of goal)")

        return {
            'period': f'Last {weeks} week(s)',
            'days_logged': len(daily_summaries),
            'averages': {
                'calories': round(avg_calories, 2),
                'protein': round(avg_protein, 2),
                'carbs': round(avg_carbs, 2),
                'fats': round(avg_fats, 2)
            },
            'patterns': patterns,
            'daily_summary': daily_summaries
        }
