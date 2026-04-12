"""
AI recommendations routes
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from app.utils.decorators import require_auth
from app.services.ai_recommendations import RecommendationEngine

recommendations_bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

@recommendations_bp.route('/daily/<date_str>', methods=['GET'], strict_slashes=False)
@require_auth
def get_daily_recommendations(user_id, date_str):
    """
    Get AI recommendations for a specific date
    Date format: YYYY-MM-DD
    """
    try:
        # Validate date format
        try:
            datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        recommendations = RecommendationEngine.get_daily_recommendations(user_id, date_str)
        
        if 'error' in recommendations:
            return jsonify(recommendations), 400
        
        return jsonify(recommendations), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@recommendations_bp.route('/today', methods=['GET'], strict_slashes=False)
@require_auth
def get_today_recommendations(user_id):
    """
    Get AI recommendations for today
    """
    try:
        today = datetime.now().strftime('%Y-%m-%d')
        recommendations = RecommendationEngine.get_daily_recommendations(user_id, today)
        
        if 'error' in recommendations:
            return jsonify(recommendations), 400
        
        return jsonify(recommendations), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@recommendations_bp.route('/weekly-trends', methods=['GET'], strict_slashes=False)
@require_auth
def get_weekly_trends(user_id):
    """
    Get weekly trend analysis
    """
    try:
        # Get weeks parameter from query string (default: 1)
        weeks = request.args.get('weeks', 1, type=int)
        
        if weeks < 1 or weeks > 12:
            return jsonify({'error': 'Weeks must be between 1 and 12'}), 400
        
        trends = RecommendationEngine.analyze_weekly_trends(user_id, weeks)
        
        if 'error' in trends:
            return jsonify(trends), 400
        
        return jsonify(trends), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@recommendations_bp.route('/food-database', methods=['GET'], strict_slashes=False)
def get_food_database():
    """
    Get predefined food database (public endpoint)
    """
    try:
        from app.services.ai_recommendations import FOOD_DATABASE
        
        return jsonify({
            'food_database': FOOD_DATABASE
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400
