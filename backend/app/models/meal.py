"""
Meal/Food logging model and database operations
"""
from datetime import datetime
from app.utils.firebase_config import get_firestore

class Meal:
    """
    Model for individual meals/food entries
    """
    
    def __init__(self, user_id, food_name, calories, protein, carbs, fats, meal_type='snack'):
        self.user_id = user_id
        self.food_name = food_name
        self.calories = calories
        self.protein = protein
        self.carbs = carbs
        self.fats = fats
        self.meal_type = meal_type  # breakfast, lunch, dinner, snack
        self.created_at = datetime.now()
    
    def save(self):
        """
        Save meal to Firestore
        """
        db = get_firestore()
        try:
            date_str = self.created_at.strftime('%Y-%m-%d')
            meal_data = {
                'food_name': self.food_name,
                'calories': self.calories,
                'protein': self.protein,
                'carbs': self.carbs,
                'fats': self.fats,
                'meal_type': self.meal_type,
                'created_at': self.created_at
            }
            
            # Save to meals collection with date and auto-generated ID
            db.collection('users').document(self.user_id).collection('meals').document(date_str).collection('entries').add(meal_data)
            return True
        except Exception as e:
            print(f"Error saving meal: {e}")
            return False
    
    @staticmethod
    def get_daily_meals(user_id, date_str):
        """
        Get all meals for a specific date
        
        Args:
            user_id (str): User's Firebase UID
            date_str (str): Date in 'YYYY-MM-DD' format
            
        Returns:
            list: List of meals for the date
        """
        db = get_firestore()
        try:
            meals = []
            docs = db.collection('users').document(user_id).collection('meals').document(date_str).collection('entries').stream()
            
            for doc in docs:
                meal = doc.to_dict()
                meal['id'] = doc.id
                meals.append(meal)
            
            return meals
        except Exception as e:
            print(f"Error retrieving daily meals: {e}")
            return []
    
    @staticmethod
    def calculate_daily_totals(user_id, date_str):
        """
        Calculate daily totals for macronutrients
        
        Args:
            user_id (str): User's Firebase UID
            date_str (str): Date in 'YYYY-MM-DD' format
            
        Returns:
            dict: Totals for calories, protein, carbs, fats
        """
        meals = Meal.get_daily_meals(user_id, date_str)
        
        totals = {
            'calories': 0,
            'protein': 0,
            'carbs': 0,
            'fats': 0,
            'meal_count': len(meals)
        }
        
        for meal in meals:
            totals['calories'] += meal.get('calories', 0)
            totals['protein'] += meal.get('protein', 0)
            totals['carbs'] += meal.get('carbs', 0)
            totals['fats'] += meal.get('fats', 0)
        
        return totals
    
    @staticmethod
    def delete_meal(user_id, date_str, meal_id):
        """
        Delete a specific meal entry
        
        Args:
            user_id (str): User's Firebase UID
            date_str (str): Date in 'YYYY-MM-DD' format
            meal_id (str): Meal document ID
            
        Returns:
            bool: Success status
        """
        db = get_firestore()
        try:
            db.collection('users').document(user_id).collection('meals').document(date_str).collection('entries').document(meal_id).delete()
            return True
        except Exception as e:
            print(f"Error deleting meal: {e}")
            return False
