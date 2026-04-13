"""
User goals management routes
"""
from flask import Blueprint, request, jsonify
from app.utils.decorators import require_auth
from app.models.user_goals import UserGoals
from app.utils.firebase_config import get_firestore

goals_bp = Blueprint('goals', __name__, url_prefix='/api/goals')


@goals_bp.route('/set', methods=['POST'], strict_slashes=False)
@require_auth
def set_goals(user_id):
    """
    Set user's daily nutrition goals
    Expected JSON: {"calories": 2000, "protein": 150, "carbs": 250, "fats": 65}
    """
    try:
        print(f"📝 Setting goals for user: {user_id}")
        data = request.get_json()
        print(f"📝 Received data: {data}")

        # Validate input
        required_fields = ['calories', 'protein', 'carbs', 'fats']
        if not all(field in data for field in required_fields):
            print(
                f"❌ Missing fields. Required: {required_fields}, Got: {list(data.keys()) if data else 'None'}")
            return jsonify({'error': f'Missing required fields: {required_fields}'}), 400

        # Validate values are positive
        if any(data[field] <= 0 for field in required_fields):
            print(f"❌ Invalid values - some are <= 0")
            return jsonify({'error': 'All values must be positive'}), 400

        # Create and save goals
        goals = UserGoals(
            user_id=user_id,
            calories=data['calories'],
            protein=data['protein'],
            carbs=data['carbs'],
            fats=data['fats']
        )

        print(f"📝 Attempting to save goals: {goals}")
        if goals.save():
            # Update user document to mark goals as set
            # Use set with merge=True to create document if it doesn't exist
            db = get_firestore()
            db.collection('users').document(user_id).set(
                {'goals_set': True}, merge=True)
            print(f"✅ Goals saved successfully for user: {user_id}")

            return jsonify({
                'message': 'Goals set successfully',
                'goals': {
                    'calories': data['calories'],
                    'protein': data['protein'],
                    'carbs': data['carbs'],
                    'fats': data['fats']
                }
            }), 201
        else:
            print(f"❌ Failed to save goals object")
            return jsonify({'error': 'Failed to save goals'}), 500

    except Exception as e:
        print(f"❌ Exception in set_goals: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400


@goals_bp.route('/get', methods=['GET'], strict_slashes=False)
@require_auth
def get_goals(user_id):
    """
    Get user's current nutrition goals
    """
    try:
        print(f"🔍 Getting goals for user: {user_id}")
        goals = UserGoals.get(user_id)
        print(f"📊 Goals retrieved: {goals}")

        if not goals:
            print(f"⚠️ No goals found for user {user_id}")
            return jsonify({
                'message': 'No goals set yet',
                'goals_set': False
            }), 404

        print(f"✅ Returning goals: {goals}")
        return jsonify({
            'goals': goals,
            'goals_set': True
        }), 200

    except Exception as e:
        print(f"❌ Error in get_goals: {str(e)}")
        return jsonify({'error': str(e)}), 400


@goals_bp.route('/update', methods=['PUT'], strict_slashes=False)
@require_auth
def update_goals(user_id):
    """
    Update user's daily nutrition goals
    Expected JSON: {"calories": 2200, "protein": 160, "carbs": 270, "fats": 70}
    """
    try:
        data = request.get_json()

        # Validate input
        required_fields = ['calories', 'protein', 'carbs', 'fats']
        if not all(field in data for field in required_fields):
            return jsonify({'error': f'Missing required fields: {required_fields}'}), 400

        # Validate values are positive
        if any(data[field] <= 0 for field in required_fields):
            return jsonify({'error': 'All values must be positive'}), 400

        if UserGoals.update(user_id, data['calories'], data['protein'], data['carbs'], data['fats']):
            return jsonify({
                'message': 'Goals updated successfully',
                'goals': {
                    'calories': data['calories'],
                    'protein': data['protein'],
                    'carbs': data['carbs'],
                    'fats': data['fats']
                }
            }), 200
        else:
            return jsonify({'error': 'Failed to update goals'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 400
