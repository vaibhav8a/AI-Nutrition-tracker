"""
Meal tracking routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from app.utils.decorators import require_auth
from app.models.meal import Meal

meals_bp = Blueprint('meals', __name__, url_prefix='/api/meals')

@meals_bp.route('/add', methods=['POST'], strict_slashes=False)
@require_auth
def add_meal(user_id):
    """
    Add a new meal/food entry
    Expected JSON: {
        "food_name": "Grilled Chicken",
        "calories": 250,
        "protein": 35,
        "carbs": 0,
        "fats": 10,
        "meal_type": "lunch"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['food_name', 'calories', 'protein', 'carbs', 'fats']
        if not all(field in data for field in required_fields):
            return jsonify({'error': f'Missing required fields: {required_fields}'}), 400
        
        # Validate numeric values
        try:
            calories = float(data['calories'])
            protein = float(data['protein'])
            carbs = float(data['carbs'])
            fats = float(data['fats'])
            
            if any(v < 0 for v in [calories, protein, carbs, fats]):
                return jsonify({'error': 'Nutritional values cannot be negative'}), 400
        except ValueError:
            return jsonify({'error': 'Nutritional values must be numbers'}), 400
        
        meal_type = data.get('meal_type', 'snack')
        
        # Create and save meal
        meal = Meal(
            user_id=user_id,
            food_name=data['food_name'],
            calories=calories,
            protein=protein,
            carbs=carbs,
            fats=fats,
            meal_type=meal_type
        )
        
        if meal.save():
            return jsonify({
                'message': 'Meal added successfully',
                'meal': {
                    'food_name': data['food_name'],
                    'calories': calories,
                    'protein': protein,
                    'carbs': carbs,
                    'fats': fats,
                    'meal_type': meal_type,
                    'timestamp': meal.created_at.isoformat()
                }
            }), 201
        else:
            return jsonify({'error': 'Failed to save meal'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@meals_bp.route('/daily/<date_str>', methods=['GET'], strict_slashes=False)
@require_auth
def get_daily_meals(user_id, date_str):
    """
    Get all meals for a specific date
    Date format: YYYY-MM-DD
    """
    try:
        # Validate date format
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        meals = Meal.get_daily_meals(user_id, date_str)
        
        return jsonify({
            'date': date_str,
            'meals': meals,
            'meal_count': len(meals)
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@meals_bp.route('/daily-totals/<date_str>', methods=['GET'], strict_slashes=False)
@require_auth
def get_daily_totals(user_id, date_str):
    """
    Get daily totals for a specific date
    Date format: YYYY-MM-DD
    """
    try:
        # Validate date format
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        totals = Meal.calculate_daily_totals(user_id, date_str)
        
        return jsonify({
            'date': date_str,
            'totals': totals
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@meals_bp.route('/delete/<date_str>/<meal_id>', methods=['DELETE'], strict_slashes=False)
@require_auth
def delete_meal(user_id, date_str, meal_id):
    """
    Delete a specific meal entry
    Date format: YYYY-MM-DD
    """
    try:
        # Validate date format
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        if Meal.delete_meal(user_id, date_str, meal_id):
            return jsonify({'message': 'Meal deleted successfully'}), 200
        else:
            return jsonify({'error': 'Failed to delete meal'}), 500
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400
