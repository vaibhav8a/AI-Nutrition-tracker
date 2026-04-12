"""
Authentication routes for user login and signup
"""
from flask import Blueprint, request, jsonify
import firebase_admin.auth as auth
from app.utils.firebase_config import get_firestore

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Create a new user account
    Expected JSON: {"email": "user@example.com", "password": "password123"}
    """
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400

        # Create user in Firebase Authentication
        user = auth.create_user(email=email, password=password)

        # Initialize user document in Firestore
        db = get_firestore()
        db.collection('users').document(user.uid).set({
            'email': email,
            'created_at': auth.get_user(user.uid).user_metadata.creation_time,
            'goals_set': False
        })

        return jsonify({
            'message': 'User created successfully',
            'uid': user.uid,
            'email': user.email
        }), 201

    except auth.EmailAlreadyExistsError:
        return jsonify({'error': 'Email already exists'}), 400
    except auth.WeakPasswordError:
        return jsonify({'error': 'Password is too weak'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login endpoint
    Expected JSON: {"email": "user@example.com", "password": "password123"}
    Note: In production, use Firebase SDK on frontend for token generation
    This is a reference endpoint for understanding the flow
    """
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'error': 'Email required'}), 400

        # Verify user exists
        user = auth.get_user_by_email(email)

        # Get user data
        db = get_firestore()
        user_doc = db.collection('users').document(user.uid).get()

        if not user_doc.exists:
            return jsonify({'error': 'User data not found'}), 404

        return jsonify({
            'message': 'Login successful',
            'uid': user.uid,
            'email': user.email,
            'goals_set': user_doc.to_dict().get('goals_set', False)
        }), 200

    except auth.UserNotFoundError:
        return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """
    Verify Firebase ID token
    Expected JSON: {"token": "firebase_id_token"}
    """
    try:
        data = request.get_json()
        token = data.get('token')

        if not token:
            return jsonify({'error': 'Token required'}), 400

        # Verify token
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        # Get user data
        db = get_firestore()
        user_doc = db.collection('users').document(uid).get()

        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404

        user_data = user_doc.to_dict()

        return jsonify({
            'valid': True,
            'uid': uid,
            'email': decoded_token['email'],
            'goals_set': user_data.get('goals_set', False)
        }), 200

    except auth.ExpiredIdTokenError:
        return jsonify({'error': 'Token expired'}), 401
    except auth.InvalidIdTokenError:
        return jsonify({'error': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@auth_bp.route('/user-info', methods=['GET'])
def get_user_info():
    """
    Get current user information (requires authentication)
    Header: Authorization: Bearer <token>
    """
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Missing authorization header'}), 401

        token = auth_header.split(' ')[1]
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']

        # Get user data
        db = get_firestore()
        user_doc = db.collection('users').document(uid).get()

        if not user_doc.exists:
            return jsonify({'error': 'User not found'}), 404

        return jsonify(user_doc.to_dict()), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """
    Logout endpoint (frontend handles token deletion)
    """
    return jsonify({'message': 'Logout successful'}), 200
