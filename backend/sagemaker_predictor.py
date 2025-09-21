import boto3
import json
import pandas as pd
from datetime import datetime

class SageMakerPredictor:
    def __init__(self, endpoint_name="crowd-management-endpoint"):
        self.sagemaker_runtime = boto3.client('sagemaker-runtime')
        self.endpoint_name = endpoint_name
    
    def prepare_features(self, event_data):
        """Convert event data to ML features"""
        features = [
            event_data['crowd_outside'],
            event_data['transport_arrival_next_10min'],
            float(event_data['crowd_growth_rate']),
            event_data['queue_data']['GateA'],
            event_data['queue_data']['GateB'], 
            event_data['queue_data']['GateC'],
            event_data['queue_data']['GateD'],
            event_data['heatmap_data']['SectionA'],
            event_data['heatmap_data']['SectionB'],
            event_data['heatmap_data']['SectionC'],
            event_data['heatmap_data']['SectionD'],
            event_data['heatmap_data']['Food Court'],
            event_data['heatmap_data']['Toilet'],
            float(event_data['parking_occupancy_percent']),
            event_data['staff_security'],
            event_data['staff_food'],
            event_data['staff_medical'],
            # Encode categorical features
            1 if event_data['weather_condition'] == 'Clear' else 0,
            1 if event_data['weather_condition'] == 'Cloudy' else 0,
            1 if event_data['weather_condition'] == 'Light_Rain' else 0,
            1 if event_data['weather_condition'] == 'Heavy_Rain' else 0,
            1 if event_data['scenario_phase'] == 'pre_event' else 0,
            1 if event_data['scenario_phase'] == 'entry_start' else 0,
            1 if event_data['scenario_phase'] == 'entry_rush' else 0,
            1 if event_data['scenario_phase'] == 'event_active' else 0,
            1 if 'halftime' in event_data['scenario_phase'] else 0,
            1 if 'exit' in event_data['scenario_phase'] else 0
        ]
        return features
    
    def predict(self, event_data):
        """Make prediction using SageMaker endpoint"""
        try:
            features = self.prepare_features(event_data)
            
            # Format for SageMaker
            payload = {
                "instances": [features]
            }
            
            response = self.sagemaker_runtime.invoke_endpoint(
                EndpointName=self.endpoint_name,
                ContentType='application/json',
                Body=json.dumps(payload)
            )
            
            result = json.loads(response['Body'].read().decode())
            
            # Parse predictions (assuming model returns 4 outputs)
            predictions = result['predictions'][0]
            
            return {
                'risk_level': self._decode_risk_level(predictions[0]),
                'predicted_risk_next_15min': self._decode_risk_level(predictions[1]),
                'bottleneck_prediction': self._decode_bottleneck(predictions[2]),
                'recommended_action': self._decode_action(predictions[3]),
                'confidence_score': predictions[4] if len(predictions) > 4 else 0.85
            }
            
        except Exception as e:
            print(f"SageMaker prediction failed: {e}")
            # Fallback to rule-based prediction
            return self._fallback_prediction(event_data)
    
    def _decode_risk_level(self, prediction):
        risk_levels = ['Low', 'Medium', 'High', 'Critical']
        return risk_levels[int(prediction)]
    
    def _decode_bottleneck(self, prediction):
        bottlenecks = ['No_Bottleneck', 'Gate_A_Bottleneck', 'Food_Court_Bottleneck', 'Toilet_Bottleneck']
        return bottlenecks[int(prediction)]
    
    def _decode_action(self, prediction):
        actions = ['monitor_only', 'open_gate_b_critical', 'manage_food_queue', 'balanced_exit', 'normal_operations']
        return actions[int(prediction)]
    
    def _fallback_prediction(self, event_data):
        """Simple rule-based fallback when SageMaker fails"""
        max_queue = max(event_data['queue_data'].values())
        food_court = event_data['heatmap_data']['Food Court']
        
        if max_queue > 150:
            risk = 'Critical'
            bottleneck = 'Gate_A_Bottleneck'
            action = 'open_gate_b_critical'
        elif food_court > 200:
            risk = 'High'
            bottleneck = 'Food_Court_Bottleneck'
            action = 'manage_food_queue'
        elif max_queue > 80:
            risk = 'Medium'
            bottleneck = 'No_Bottleneck'
            action = 'balanced_exit'
        else:
            risk = 'Low'
            bottleneck = 'No_Bottleneck'
            action = 'normal_operations'
        
        return {
            'risk_level': risk,
            'predicted_risk_next_15min': risk,
            'bottleneck_prediction': bottleneck,
            'recommended_action': action,
            'confidence_score': 0.75
        }