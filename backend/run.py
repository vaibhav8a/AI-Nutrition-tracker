"""
Flask application entry point
"""
import os
from dotenv import load_dotenv
from app import create_app

# Load environment variables
load_dotenv()

# Create Flask app
app = create_app()

@app.route('/', methods=['GET'])
def home():
    """Home endpoint"""
    return {
        'message': 'AI Nutrition Tracker API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth',
            'goals': '/api/goals',
            'meals': '/api/meals',
            'recommendations': '/api/recommendations',
            'summary': '/api/summary'
        }
    }, 200

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    # Run the Flask development server
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True') == 'True'
    app.run(host='0.0.0.0', port=port, debug=debug)
