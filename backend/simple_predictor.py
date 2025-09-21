"""Simple rule-based predictor without ML dependencies"""
from decimal import Decimal

class SimplePredictor:
    def predict(self, event_data):
        """Make predictions using simple rules"""
        try:
            max_queue = max(event_data['queue_data'].values())
            food_court = event_data['heatmap_data']['Food Court']
            crowd_outside = event_data['crowd_outside']
            scenario_phase = event_data['scenario_phase']
            
            # Risk assessment
            if max_queue > 150 or crowd_outside > 400:
                risk = 'Critical'
            elif max_queue > 80 or crowd_outside > 200:
                risk = 'High'
            elif max_queue > 40 or crowd_outside > 100:
                risk = 'Medium'
            else:
                risk = 'Low'
            
            # Bottleneck prediction
            if max_queue > 150:
                bottleneck = 'Gate_A_Bottleneck'
            elif food_court > 200:
                bottleneck = 'Food_Court_Bottleneck'
            elif event_data['heatmap_data']['Toilet'] > 100:
                bottleneck = 'Toilet_Bottleneck'
            else:
                bottleneck = 'No_Bottleneck'
            
            # Action recommendation
            if bottleneck == 'Gate_A_Bottleneck':
                action = 'open_gate_b_critical'
            elif bottleneck == 'Food_Court_Bottleneck':
                action = 'manage_food_queue'
            elif bottleneck == 'Toilet_Bottleneck':
                action = 'deploy_food_staff'
            elif scenario_phase == 'pre_event':
                action = 'prepare_gates' if crowd_outside > 50 else 'monitor_only'
            elif 'entry' in scenario_phase:
                action = 'balanced_flow' if max_queue < 60 else 'open_gate_c'
            elif 'exit' in scenario_phase:
                action = 'balanced_exit'
            else:
                action = 'normal_operations'
            
            return {
                'risk_level': risk,
                'predicted_risk_next_15min': risk,
                'bottleneck_prediction': bottleneck,
                'recommended_action': action,
                'confidence_score': Decimal('0.85')
            }
            
        except Exception as e:
            print(f"Prediction error: {e}")
            return {
                'risk_level': 'Low',
                'predicted_risk_next_15min': 'Low',
                'bottleneck_prediction': 'No_Bottleneck',
                'recommended_action': 'monitor_only',
                'confidence_score': Decimal('0.50')
            }