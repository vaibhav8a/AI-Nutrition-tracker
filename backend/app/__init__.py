"""
Flask application factory and initialization
"""
from flask import Flask
from flask_cors import CORS
from app.utils.firebase_config import initialize_firebase


def create_app():
    """
    Create and configure the Flask application
    """
    app = Flask(__name__)

    # Enable CORS for frontend communication
    CORS(app, origins=["http://localhost:5000", "http://localhost:5001", "http://localhost:8000", "http://localhost:3000", "127.0.0.1:8000", "127.0.0.1:5001"])

    # Initialize Firebase
    initialize_firebase()

    # Register blueprints (routes)
    from app.routes.auth import auth_bp
    from app.routes.goals import goals_bp
    from app.routes.meals import meals_bp
    from app.routes.recommendations import recommendations_bp
    from app.routes.summary import summary_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(goals_bp)
    app.register_blueprint(meals_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(summary_bp)

    return app
