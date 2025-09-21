
import joblib
import json
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression

def model_fn(model_dir):
    """Load models for SageMaker inference"""
    models = {}
    
    # Load general models
    models['general_risk'] = joblib.load(f'{model_dir}/general_risk_model.pkl')
    models['general_bottleneck'] = joblib.load(f'{model_dir}/general_bottleneck_model.pkl')
    models['general_action'] = joblib.load(f'{model_dir}/general_action_model.pkl')
    
    # Load encoders
    models['risk_encoder'] = joblib.load(f'{model_dir}/risk_encoder.pkl')
    models['bottleneck_encoder'] = joblib.load(f'{model_dir}/bottleneck_encoder.pkl')
    models['action_encoder'] = joblib.load(f'{model_dir}/action_encoder.pkl')
    
    # Load metadata
    with open(f'{model_dir}/model_metadata.json', 'r') as f:
        models['metadata'] = json.load(f)
    
    return models

def predict_fn(input_data, models):
    """Make predictions using loaded models"""
    try:
        # Parse input
        if isinstance(input_data, str):
            input_data = json.loads(input_data)
        
        # Extract features
        features = input_data.get('features', [])
        scenario_type = input_data.get('scenario_type', 'general')
        
        # Convert to numpy array
        X = np.array(features).reshape(1, -1)
        
        # Make predictions using general models
        risk_pred = models['general_risk'].predict(X)[0]
        bottleneck_pred = models['general_bottleneck'].predict(X)[0]
        action_pred = models['general_action'].predict(X)[0]
        
        # Get confidence scores
        risk_proba = models['general_risk'].predict_proba(X)[0].max()
        
        # Decode predictions
        risk_level = models['risk_encoder'].inverse_transform([risk_pred])[0]
        bottleneck = models['bottleneck_encoder'].inverse_transform([bottleneck_pred])[0]
        action = models['action_encoder'].inverse_transform([action_pred])[0]
        
        return {
            'risk_level': risk_level,
            'bottleneck_prediction': bottleneck,
            'recommended_action': action,
            'confidence_score': float(risk_proba),
            'scenario_type': scenario_type,
            'model_version': models['metadata']['model_version']
        }
    
    except Exception as e:
        return {'error': str(e)}

def input_fn(request_body, request_content_type):
    """Parse input data"""
    if request_content_type == 'application/json':
        return json.loads(request_body)
    else:
        raise ValueError(f'Unsupported content type: {request_content_type}')

def output_fn(prediction, accept):
    """Format output"""
    if accept == 'application/json':
        return json.dumps(prediction), accept
    else:
        raise ValueError(f'Unsupported accept type: {accept}')
