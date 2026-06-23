import datetime
import math
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sklearn.ensemble import RandomForestRegressor

app = FastAPI(title="QueueLess AI Demand Prediction Service")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model state
model = None
feature_columns = ["day_of_week", "hour", "is_exam_week", "is_weekend"]

def generate_historical_data():
    """
    Generates realistic historical orders for a college campus cafeteria over 60 days.
    """
    data = []
    base_date = datetime.datetime.now() - datetime.timedelta(days=60)
    
    # Standard food menu items
    items = ["Veg Burger", "Masala Dosa", "Paneer Roll", "Samosa", "Cold Coffee", "Chai"]
    
    for day_offset in range(60):
        current_date = base_date + datetime.timedelta(days=day_offset)
        day_of_week = current_date.weekday() # 0 = Monday, 6 = Sunday
        is_weekend = 1 if day_of_week >= 5 else 0
        is_exam_week = 1 if (15 <= day_offset <= 22) else 0
        
        # Campus activity peaks during 9 AM (Breakfast), 12 PM - 2 PM (Lunch), and 5 PM - 6 PM (Snacks)
        for hour in range(8, 20):
            # Calculate base hourly demand based on college routines
            if is_weekend:
                base_demand = 10  # Low demand on weekends
            else:
                if hour == 9:
                    base_demand = 45  # Breakfast peak
                elif hour in [12, 13]:
                    base_demand = 95  # Primary lunch rush
                elif hour == 14:
                    base_demand = 60  # Late lunch
                elif hour in [17, 18]:
                    base_demand = 55  # Evening snack rush
                else:
                    base_demand = 20  # General hours
            
            # Apply exam week modifications (students stay on campus longer, late afternoon spike, overall lower lunch peak)
            if is_exam_week and not is_weekend:
                base_demand = base_demand * 0.85
                if hour in [15, 16, 17]:
                    base_demand += 15 # extra study snacks
            
            # Add random noise
            noise = np.random.normal(0, base_demand * 0.15)
            predicted_orders = max(0, int(base_demand + noise))
            
            data.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "day_of_week": day_of_week,
                "hour": hour,
                "is_exam_week": is_exam_week,
                "is_weekend": is_weekend,
                "orders": predicted_orders
            })
            
    return pd.DataFrame(data)

def train_model():
    global model
    df = generate_historical_data()
    X = df[feature_columns]
    y = df["orders"]
    
    # Train random forest regressor
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)
    print("AI Model successfully trained on campus eating behaviors.")

# Train the model at startup
train_model()

@app.get("/")
def read_root():
    return {"status": "AI service is running", "model_trained": model is not None}

@app.get("/api/prediction")
def get_prediction():
    """
    Exposes predictions for tomorrow's lunch rush and demand counts.
    """
    tomorrow = datetime.datetime.now() + datetime.timedelta(days=1)
    tomorrow_day_of_week = tomorrow.weekday()
    tomorrow_is_weekend = 1 if tomorrow_day_of_week >= 5 else 0
    # Simulate an exam week indicator based on day of month (e.g. late June is exam week)
    tomorrow_is_exam_week = 1 if (20 <= tomorrow.day <= 27) else 0
    
    # Predict peak hours using trained model
    hours = list(range(8, 20))
    predictions = []
    
    for hr in hours:
        feat = pd.DataFrame([[tomorrow_day_of_week, hr, tomorrow_is_exam_week, tomorrow_is_weekend]], columns=feature_columns)
        pred = float(model.predict(feat)[0])
        # Smooth and format hour
        ampm = "AM" if hr < 12 else "PM"
        display_hr = hr if hr <= 12 else hr - 12
        predictions.append({
            "hour": f"{display_hr} {ampm}",
            "orders": max(5, int(round(pred)))
        })
        
    # Calculate totals
    lunch_rush_total = sum(p["orders"] for p in predictions if "12 PM" in p["hour"] or "1 PM" in p["hour"] or "2 PM" in p["hour"])
    total_day_orders = sum(p["orders"] for p in predictions)
    
    # Formulate recommendation
    if tomorrow_is_weekend:
        recommendation = "Low Weekend Traffic. Prepare 40% Less Inventory."
    elif tomorrow_is_exam_week:
        recommendation = "Exam Period. Prepare 15% Extra Study-Snacks (Coffee/Chai) but 10% Less Hot Meals."
    elif lunch_rush_total > 150:
        recommendation = "Heavy Lunch Rush Expected. Prepare 25% Extra Meals and pre-box snacks."
    else:
        recommendation = "Standard Campus Traffic. Prepare baseline inventory."
        
    # Food item recommendations breakdown (Popular Items Prediction)
    popular_items = [
        {"name": "🍔 Veg Burger", "predictedCount": max(15, int(total_day_orders * 0.35))},
        {"name": "🍛 Masala Dosa", "predictedCount": max(10, int(total_day_orders * 0.25))},
        {"name": "🌯 Paneer Roll", "predictedCount": max(8, int(total_day_orders * 0.20))},
        {"name": "☕ Cold Coffee", "predictedCount": max(12, int(total_day_orders * 0.30))},
        {"name": "🍵 Chai", "predictedCount": max(20, int(total_day_orders * 0.40))},
    ]
    
    # Identify peak hour
    peak_pred = max(predictions, key=lambda x: x["orders"])
    
    return {
        "tomorrowLunchRush": {
            "expectedOrders": int(lunch_rush_total),
            "totalDayOrders": int(total_day_orders),
            "recommendation": recommendation,
            "details": f"High likelihood of campus rush at {peak_pred['hour']} with ~{peak_pred['orders']} orders."
        },
        "peakHours": predictions,
        "popularItemsPrediction": popular_items
    }
