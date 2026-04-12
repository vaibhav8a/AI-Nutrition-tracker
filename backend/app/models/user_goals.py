"""
User goals model and database operations
"""
from datetime import datetime
from app.utils.firebase_config import get_firestore

class UserGoals:
    """
    Model for managing user daily nutrition goals
    """
    
    def __init__(self, user_id, calories, protein, carbs, fats):
        self.user_id = user_id
        self.calories = calories
        self.protein = protein
        self.carbs = carbs
        self.fats = fats
        self.created_at = datetime.now()
    
    def save(self):
        """
        Save user goals to Firestore
        """
        db = get_firestore()
        try:
            db.collection('users').document(self.user_id).collection('goals').document('daily').set({
                'calories': self.calories,
                'protein': self.protein,
                'carbs': self.carbs,
                'fats': self.fats,
                'updated_at': datetime.now()
            })
            return True
        except Exception as e:
            print(f"Error saving goals: {e}")
            return False
    
    @staticmethod
    def get(user_id):
        """
        Retrieve user goals from Firestore
        
        Args:
            user_id (str): User's Firebase UID
            
        Returns:
            dict: User goals or None if not found
        """
        db = get_firestore()
        try:
            doc = db.collection('users').document(user_id).collection('goals').document('daily').get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            print(f"Error retrieving goals: {e}")
            return None
    
    @staticmethod
    def update(user_id, calories, protein, carbs, fats):
        """
        Update user goals
        
        Args:
            user_id (str): User's Firebase UID
            calories (int): Daily calorie goal
            protein (int): Daily protein goal in grams
            carbs (int): Daily carbs goal in grams
            fats (int): Daily fats goal in grams
            
        Returns:
            bool: Success status
        """
        db = get_firestore()
        try:
            db.collection('users').document(user_id).collection('goals').document('daily').update({
                'calories': calories,
                'protein': protein,
                'carbs': carbs,
                'fats': fats,
                'updated_at': datetime.now()
            })
            return True
        except Exception as e:
            print(f"Error updating goals: {e}")
            return False
