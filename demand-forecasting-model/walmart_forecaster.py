import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_percentage_error, mean_squared_error
from sklearn.preprocessing import LabelEncoder
import warnings
warnings.filterwarnings('ignore')

class WalmartDemandForecaster:
    def __init__(self):
        self.models = {}  # Store models for each store-product combination
        self.label_encoders = {}
        self.feature_columns = []
        
    def load_data(self, sales_path, weather_path, events_path):
        """Load and merge all datasets"""
        print("Loading datasets...")
        
        # Load data
        self.sales_df = pd.read_csv(sales_path)
        self.weather_df = pd.read_csv(weather_path)
        self.events_df = pd.read_csv(events_path)
        
        # Convert dates
        self.sales_df['date'] = pd.to_datetime(self.sales_df['date'])
        self.weather_df['date'] = pd.to_datetime(self.weather_df['date'])
        self.events_df['date'] = pd.to_datetime(self.events_df['date'])
        
        print(f"Loaded {len(self.sales_df)} sales records")
        print(f"Loaded {len(self.weather_df)} weather records")
        print(f"Loaded {len(self.events_df)} event records")
        
    def create_features(self):
        """Create ML features from raw data"""
        print("Creating features...")
        
        # Start with sales data (already contains some weather and event info)
        df = self.sales_df.copy()
        
        # Add humidity from weather data (the only missing weather feature)
        weather_subset = self.weather_df[['date', 'store_id', 'humidity']].copy()
        df = df.merge(weather_subset, on=['date', 'store_id'], how='left')
        
        # Handle event impact - use existing event_impact from sales, 
        # but merge with events for additional validation if needed
        events_subset = self.events_df[['date', 'store_id', 'impact_multiplier']].copy()
        df = df.merge(events_subset, on=['date', 'store_id'], how='left')
        
        # Use event_impact from sales data, fall back to impact_multiplier if missing
        df['final_event_impact'] = df['event_impact'].fillna(df['impact_multiplier'].fillna(1.0))
        
        # Create time-based features
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_month'] = df['date'].dt.day
        df['month'] = df['date'].dt.month
        df['year'] = df['date'].dt.year
        
        # Convert boolean columns to numeric
        df['is_rainy'] = df['is_rainy'].astype(int)
        df['is_weekend'] = df['is_weekend'].astype(int)
        
        # Create lag features for each store-product combination
        print("Creating lag features...")
        df = df.sort_values(['store_id', 'product', 'date'])
        
        for window in [7, 14, 30]:
            df[f'sales_lag_{window}'] = df.groupby(['store_id', 'product'])['sales_quantity'].shift(window)
            df[f'sales_rolling_{window}'] = df.groupby(['store_id', 'product'])['sales_quantity'].rolling(window).mean().values
        
        # Fill NaN values for lag features using forward fill then backward fill
        df = df.fillna(method='ffill').fillna(method='bfill').fillna(0)
        
        # Encode categorical variables
        categorical_cols = ['product', 'season', 'store_id']
        for col in categorical_cols:
            if col in df.columns:
                le = LabelEncoder()
                df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
                self.label_encoders[col] = le
        
        # Select feature columns (updated to match available data)
        self.feature_columns = [
            'temperature', 'is_rainy', 'humidity', 'is_weekend', 'final_event_impact',
            'day_of_week', 'day_of_month', 'month',
            'sales_lag_7', 'sales_lag_14', 'sales_lag_30',
            'sales_rolling_7', 'sales_rolling_14', 'sales_rolling_30',
            'product_encoded', 'season_encoded', 'store_id_encoded'
        ]
        
        # Verify all feature columns exist
        missing_cols = [col for col in self.feature_columns if col not in df.columns]
        if missing_cols:
            print(f"Warning: Missing columns: {missing_cols}")
            self.feature_columns = [col for col in self.feature_columns if col in df.columns]
        
        self.processed_df = df
        print(f"Created {len(self.feature_columns)} features")
        print(f"Feature columns: {self.feature_columns}")
        
    def train_models(self):
        """Train models for each store-product combination"""
        print("Training models...")
        
        # Split data: 2022 for training, 2023 for testing
        train_df = self.processed_df[self.processed_df['year'] == 2022]
        test_df = self.processed_df[self.processed_df['year'] == 2023]
        
        print(f"Training data: {len(train_df)} records")
        print(f"Testing data: {len(test_df)} records")
        
        # Get unique store-product combinations
        combinations = self.processed_df[['store_id', 'product']].drop_duplicates()
        print(f"Training models for {len(combinations)} store-product combinations")
        
        self.model_performance = {}
        successful_models = 0
        
        for _, row in combinations.iterrows():
            store_id = row['store_id']
            product = row['product']
            
            # Filter data for this combination
            train_subset = train_df[(train_df['store_id'] == store_id) & 
                                   (train_df['product'] == product)]
            test_subset = test_df[(test_df['store_id'] == store_id) & 
                                 (test_df['product'] == product)]
            
            if len(train_subset) < 50 or len(test_subset) < 10:
                print(f"Skipping {store_id}_{product}: insufficient data (train={len(train_subset)}, test={len(test_subset)})")
                continue
                
            # Prepare features and target
            X_train = train_subset[self.feature_columns]
            y_train = train_subset['sales_quantity']
            X_test = test_subset[self.feature_columns]
            y_test = test_subset['sales_quantity']
            
            # Check for any remaining NaN values
            if X_train.isnull().any().any() or X_test.isnull().any().any():
                print(f"Warning: NaN values found in {store_id}_{product}, filling with 0")
                X_train = X_train.fillna(0)
                X_test = X_test.fillna(0)
            
            try:
                # Train model
                model = RandomForestRegressor(n_estimators=100, random_state=42)
                model.fit(X_train, y_train)
                
                # Make predictions
                y_pred = model.predict(X_test)
                
                # Calculate metrics
                mape = mean_absolute_percentage_error(y_test, y_pred) * 100
                rmse = np.sqrt(mean_squared_error(y_test, y_pred))
                
                # Store model and performance
                model_key = f"{store_id}_{product}"
                self.models[model_key] = model
                self.model_performance[model_key] = {
                    'mape': mape,
                    'rmse': rmse,
                    'train_size': len(train_subset),
                    'test_size': len(test_subset)
                }
                
                successful_models += 1
                print(f"Trained {model_key}: MAPE={mape:.1f}%, RMSE={rmse:.1f}")
                
            except Exception as e:
                print(f"Error training {store_id}_{product}: {str(e)}")
                continue
        
        print(f"\nSuccessfully trained {successful_models} models")
        
    def predict_demand(self, store_id, product, forecast_days=7):
        """Predict demand for next N days"""
        model_key = f"{store_id}_{product}"
        
        if model_key not in self.models:
            print(f"No model found for {model_key}")
            return None
        
        model = self.models[model_key]
        
        # Get latest data for this store-product
        latest_data = self.processed_df[
            (self.processed_df['store_id'] == store_id) & 
            (self.processed_df['product'] == product)
        ].sort_values('date').tail(30)  # Last 30 days for context
        
        if len(latest_data) == 0:
            print(f"No historical data found for {model_key}")
            return None
        
        predictions = []
        
        for day in range(forecast_days):
            # Create features for prediction day
            last_row = latest_data.iloc[-1].copy()
            
            # Simulate future date
            future_date = last_row['date'] + timedelta(days=day+1)
            
            # Create prediction features
            pred_features = {}
            
            # Time features
            pred_features['day_of_week'] = future_date.weekday()
            pred_features['day_of_month'] = future_date.day
            pred_features['month'] = future_date.month
            
            # Weather features (simulate based on season)
            season = last_row['season']
            if season == 'winter':
                pred_features['temperature'] = np.random.normal(65, 10)
                pred_features['is_rainy'] = np.random.choice([0, 1], p=[0.7, 0.3])
                pred_features['humidity'] = np.random.normal(60, 10)
            elif season == 'summer':
                pred_features['temperature'] = np.random.normal(85, 8)
                pred_features['is_rainy'] = np.random.choice([0, 1], p=[0.8, 0.2])
                pred_features['humidity'] = np.random.normal(70, 12)
            else:  # spring/fall
                pred_features['temperature'] = np.random.normal(75, 12)
                pred_features['is_rainy'] = np.random.choice([0, 1], p=[0.75, 0.25])
                pred_features['humidity'] = np.random.normal(65, 15)
            
            pred_features['is_weekend'] = 1 if future_date.weekday() >= 5 else 0
            pred_features['final_event_impact'] = 1.0  # No special events predicted
            
            # Lag features (use recent sales)
            pred_features['sales_lag_7'] = latest_data.iloc[-7]['sales_quantity'] if len(latest_data) >= 7 else last_row['sales_quantity']
            pred_features['sales_lag_14'] = latest_data.iloc[-14]['sales_quantity'] if len(latest_data) >= 14 else last_row['sales_quantity']
            pred_features['sales_lag_30'] = latest_data.iloc[-30]['sales_quantity'] if len(latest_data) >= 30 else last_row['sales_quantity']
            
            # Rolling averages
            pred_features['sales_rolling_7'] = latest_data.tail(7)['sales_quantity'].mean()
            pred_features['sales_rolling_14'] = latest_data.tail(14)['sales_quantity'].mean()
            pred_features['sales_rolling_30'] = latest_data.tail(30)['sales_quantity'].mean()
            
            # Categorical features
            pred_features['product_encoded'] = last_row['product_encoded']
            pred_features['season_encoded'] = last_row['season_encoded']
            pred_features['store_id_encoded'] = last_row['store_id_encoded']
            
            # Create feature vector
            feature_vector = []
            for col in self.feature_columns:
                if col in pred_features:
                    feature_vector.append(pred_features[col])
                else:
                    feature_vector.append(0)  # Default value for missing features
            
            X_pred = np.array(feature_vector).reshape(1, -1)
            
            # Make prediction
            pred = model.predict(X_pred)[0]
            predictions.append({
                'date': future_date.strftime('%Y-%m-%d'),
                'predicted_demand': max(0, int(pred)),  # Ensure non-negative
                'confidence': 'medium'  # Simplified confidence
            })
        
        return predictions
    
    def get_model_summary(self):
        """Get summary of model performance"""
        if not self.model_performance:
            return "No models trained yet"
        
        summary = []
        for model_key, performance in self.model_performance.items():
            store_id, product = model_key.split('_', 1)
            summary.append({
                'store_id': store_id,
                'product': product,
                'mape': performance['mape'],
                'rmse': performance['rmse'],
                'train_size': performance['train_size']
            })
        
        return pd.DataFrame(summary)

# Example usage and testing
if __name__ == "__main__":
    # Initialize forecaster
    forecaster = WalmartDemandForecaster()
    
    # Load data (replace with your actual file paths)
    print("=== WALMART DEMAND FORECASTING MODEL ===\n")
    
    # File paths
    sales_path = "walmart_dummy_sales.csv"
    weather_path = "walmart_dummy_weather.csv"
    events_path = "walmart_dummy_events.csv"
    
    try:
        # Load and process data
        forecaster.load_data(sales_path, weather_path, events_path)
        forecaster.create_features()
        forecaster.train_models()
        
        # Show model performance
        print("\n=== MODEL PERFORMANCE ===")
        summary = forecaster.get_model_summary()
        if isinstance(summary, pd.DataFrame):
            print(summary.to_string(index=False))
        else:
            print(summary)
        
        # Make sample predictions
        print("\n=== SAMPLE PREDICTIONS ===")
        stores = ['store_001', 'store_002', 'store_003']
        products = ['ice_cream', 'hot_coffee', 'umbrellas']
        
        for store in stores[:1]:  # Just show one store for demo
            for product in products[:2]:  # Just show two products
                predictions = forecaster.predict_demand(store, product)
                if predictions:
                    print(f"\n{store} - {product}:")
                    for pred in predictions:
                        print(f"  {pred['date']}: {pred['predicted_demand']} units")
        
        print("\n=== MODEL READY FOR API DEPLOYMENT ===")
        
    except FileNotFoundError:
        print("CSV files not found. Please ensure the following files exist:")
        print("- walmart_dummy_sales.csv")
        print("- walmart_dummy_weather.csv")
        print("- walmart_dummy_events.csv")
        print("\nThis model is ready to use once you have the data files!")
    except Exception as e:
        print(f"Error: {str(e)}")
        print("Please check your data format and try again.")