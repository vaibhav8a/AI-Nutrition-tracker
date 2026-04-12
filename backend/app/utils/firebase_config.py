"""
Firebase initialization and configuration
"""
import os
import firebase_admin
from firebase_admin import credentials, db, firestore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Global Firebase instances
fb_app = None
firestore_db = None

def initialize_firebase():
    """
    Initialize Firebase app with service account credentials
    """
    global fb_app, firestore_db
    
    if fb_app is not None:
        return
    
    try:
        # Initialize Firebase with service account
        cred = credentials.Certificate(os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON', './serviceAccountKey.json'))
        fb_app = firebase_admin.initialize_app(cred, {
            'projectId': os.getenv('FIREBASE_PROJECT_ID')
        })
        
        # Initialize Firestore
        firestore_db = firestore.client()
        print("Firebase initialized successfully!")
        
    except Exception as e:
        print(f"Firebase initialization error: {e}")
        raise

def get_firestore():
    """
    Get Firestore database instance
    """
    global firestore_db
    if firestore_db is None:
        initialize_firebase()
    return firestore_db

def verify_id_token(id_token):
    """
    Verify Firebase ID token
    
    Args:
        id_token (str): Firebase ID token from client
        
    Returns:
        dict: Decoded token with user claims, or None if invalid
    """
    try:
        decoded_token = firebase_admin.auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Token verification error: {e}")
        return None
