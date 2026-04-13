"""
Custom decorators for authentication and validation
"""
from functools import wraps
from flask import request, jsonify
from app.utils.firebase_config import verify_id_token


def require_auth(f):
    """
    Decorator to require Firebase authentication
    Extracts user UID from token and passes it to the route handler
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        print(
            f"🔐 Auth header check: {auth_header[:20] if auth_header else 'None'}...")

        if not auth_header:
            print("❌ Missing authorization header")
            return jsonify({'error': 'Missing authorization header'}), 401

        try:
            # Extract token (format: "Bearer <token>")
            token = auth_header.split(' ')[1]
            print(f"✅ Token extracted, length: {len(token)}")
        except IndexError:
            print("❌ Invalid authorization header format")
            return jsonify({'error': 'Invalid authorization header format'}), 401

        # Verify token
        decoded_token = verify_id_token(token)
        if decoded_token is None:
            print("❌ Token verification failed")
            return jsonify({'error': 'Invalid or expired token'}), 401

        # Pass user UID to route handler
        user_uid = decoded_token['uid']
        print(f"✅ Token verified for user: {user_uid}")
        kwargs['user_id'] = user_uid
        return f(*args, **kwargs)

    return decorated_function
