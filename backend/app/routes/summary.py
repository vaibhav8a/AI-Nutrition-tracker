"""
Daily summary and dashboard routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from app.utils.decorators import require_auth
from app.models.meal import Meal
from app.models.user_goals import UserGoals

summary_bp = Blueprint('summary', __name__, url_prefix='/api/summary')


@summary_bp.route('/today', methods=['GET'], strict_slashes=False)
@require_auth
def get_today_summary(user_id):
    """
    Get today's complete nutrition summary
    """
    try:
        today = datetime.now().strftime('%Y-%m-%d')

        # Get goals
        goals = UserGoals.get(user_id)
        if not goals:
            return jsonify({'error': 'User goals not set'}), 400

        # Get daily totals
        totals = Meal.calculate_daily_totals(user_id, today)

        # Calculate percentages
        percentages = {
            'calories': round((totals['calories'] / goals['calories']) * 100, 1) if goals['calories'] > 0 else 0,
            'protein': round((totals['protein'] / goals['protein']) * 100, 1) if goals['protein'] > 0 else 0,
            'carbs': round((totals['carbs'] / goals['carbs']) * 100, 1) if goals['carbs'] > 0 else 0,
            'fats': round((totals['fats'] / goals['fats']) * 100, 1) if goals['fats'] > 0 else 0
        }

        # Calculate remaining
        remaining = {
            'calories': max(0, goals['calories'] - totals['calories']),
            'protein': max(0, goals['protein'] - totals['protein']),
            'carbs': max(0, goals['carbs'] - totals['carbs']),
            'fats': max(0, goals['fats'] - totals['fats'])
        }

        return jsonify({
            'date': today,
            'goals': goals,
            'totals': totals,
            'percentages': percentages,
            'remaining': remaining
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@summary_bp.route('/date/<date_str>', methods=['GET'], strict_slashes=False)
@require_auth
def get_date_summary(user_id, date_str):
    """
    Get nutrition summary for a specific date
    Date format: YYYY-MM-DD
    """
    try:
        # Validate date format
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400

        # Get goals
        goals = UserGoals.get(user_id)
        if not goals:
            return jsonify({'error': 'User goals not set'}), 400

        # Get daily totals
        totals = Meal.calculate_daily_totals(user_id, date_str)

        # Calculate percentages
        percentages = {
            'calories': round((totals['calories'] / goals['calories']) * 100, 1) if goals['calories'] > 0 else 0,
            'protein': round((totals['protein'] / goals['protein']) * 100, 1) if goals['protein'] > 0 else 0,
            'carbs': round((totals['carbs'] / goals['carbs']) * 100, 1) if goals['carbs'] > 0 else 0,
            'fats': round((totals['fats'] / goals['fats']) * 100, 1) if goals['fats'] > 0 else 0
        }

        # Calculate remaining
        remaining = {
            'calories': max(0, goals['calories'] - totals['calories']),
            'protein': max(0, goals['protein'] - totals['protein']),
            'carbs': max(0, goals['carbs'] - totals['carbs']),
            'fats': max(0, goals['fats'] - totals['fats'])
        }

        return jsonify({
            'date': date_str,
            'goals': goals,
            'totals': totals,
            'percentages': percentages,
            'remaining': remaining
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@summary_bp.route('/weekly', methods=['GET'], strict_slashes=False)
@require_auth
def get_weekly_summary(user_id):
    """
    Get weekly summary (last 7 days)
    """
    try:
        goals = UserGoals.get(user_id)
        if not goals:
            return jsonify({'error': 'User goals not set'}), 400

        daily_summaries = []
        weekly_totals = {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fats': 0,
            'days_logged': 0
        }

        # Collect data for each day in the past week
        for i in range(7):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            totals = Meal.calculate_daily_totals(user_id, date)

            if totals['meal_count'] > 0:
                daily_summaries.append({
                    'date': date,
                    'totals': totals,
                    'percentages': {
                        'calories': round((totals['calories'] / goals['calories']) * 100, 1) if goals['calories'] > 0 else 0,
                        'protein': round((totals['protein'] / goals['protein']) * 100, 1) if goals['protein'] > 0 else 0,
                        'carbs': round((totals['carbs'] / goals['carbs']) * 100, 1) if goals['carbs'] > 0 else 0,
                        'fats': round((totals['fats'] / goals['fats']) * 100, 1) if goals['fats'] > 0 else 0
                    }
                })

                weekly_totals['calories'] += totals['calories']
                weekly_totals['protein'] += totals['protein']
                weekly_totals['carbs'] += totals['carbs']
                weekly_totals['fats'] += totals['fats']
                weekly_totals['days_logged'] += 1

        # Calculate weekly averages
        if weekly_totals['days_logged'] > 0:
            weekly_averages = {
                'calories': round(weekly_totals['calories'] / weekly_totals['days_logged'], 1),
                'protein': round(weekly_totals['protein'] / weekly_totals['days_logged'], 1),
                'carbs': round(weekly_totals['carbs'] / weekly_totals['days_logged'], 1),
                'fats': round(weekly_totals['fats'] / weekly_totals['days_logged'], 1)
            }
        else:
            weekly_averages = {'calories': 0,
                               'protein': 0, 'carbs': 0, 'fats': 0}

        return jsonify({
            'period': 'Last 7 days',
            'goals': goals,
            'daily_summaries': daily_summaries,
            'weekly_totals': weekly_totals,
            'weekly_averages': weekly_averages
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400
