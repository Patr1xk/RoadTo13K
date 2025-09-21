import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.live_data_generator import CrowdLiveEvents
from backend.simple_predictor import SimplePredictor
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import json

def validate_live_predictions():
    """Validate ML predictions against expected results"""
    
    # Get live events from database
    live_db = CrowdLiveEvents()
    events = live_db.get_all_events()
    
    if not events:
        print("No live events found. Run live generator first:")
        print("python backend\\live_data_generator.py --live")
        return
    
    print(f"Found {len(events)} live events for validation")
    
    # Extract predictions and expected results
    predicted_risks = []
    expected_risks = []
    predicted_actions = []
    expected_actions = []
    predicted_bottlenecks = []
    expected_bottlenecks = []
    
    for event in events:
        if '_validation_data' in event:
            # Get ML predictions
            predicted_risks.append(event.get('risk_level', 'Unknown'))
            predicted_actions.append(event.get('recommended_action', 'Unknown'))
            predicted_bottlenecks.append(event.get('bottleneck_prediction', 'Unknown'))
            
            # Get expected results
            validation = event['_validation_data']
            expected_risks.append(validation['expected_risk_level'])
            expected_actions.append(validation['expected_action'])
            expected_bottlenecks.append(validation['expected_bottleneck'])
    
    if not predicted_risks:
        print("No validation data found in events")
        return
    
    # Calculate accuracy metrics
    print("\n" + "="*50)
    print("PREDICTION VALIDATION RESULTS")
    print("="*50)
    
    # Risk Level Accuracy
    risk_accuracy = accuracy_score(expected_risks, predicted_risks)
    print(f"\n🎯 RISK LEVEL ACCURACY: {risk_accuracy:.2%}")
    print("\nRisk Level Classification Report:")
    print(classification_report(expected_risks, predicted_risks))
    
    # Action Accuracy
    action_accuracy = accuracy_score(expected_actions, predicted_actions)
    print(f"\n🎯 RECOMMENDED ACTION ACCURACY: {action_accuracy:.2%}")
    print("\nAction Classification Report:")
    print(classification_report(expected_actions, predicted_actions))
    
    # Bottleneck Accuracy
    bottleneck_accuracy = accuracy_score(expected_bottlenecks, predicted_bottlenecks)
    print(f"\n🎯 BOTTLENECK PREDICTION ACCURACY: {bottleneck_accuracy:.2%}")
    print("\nBottleneck Classification Report:")
    print(classification_report(expected_bottlenecks, predicted_bottlenecks))
    
    # Overall Summary
    overall_accuracy = (risk_accuracy + action_accuracy + bottleneck_accuracy) / 3
    print(f"\n📊 OVERALL MODEL ACCURACY: {overall_accuracy:.2%}")
    
    # Detailed comparison for first 10 events
    print("\n" + "="*50)
    print("SAMPLE PREDICTIONS vs EXPECTED")
    print("="*50)
    
    for i in range(min(10, len(predicted_risks))):
        print(f"\nEvent {i+1}:")
        print(f"  Risk:       {predicted_risks[i]:12} | Expected: {expected_risks[i]}")
        print(f"  Action:     {predicted_actions[i]:12} | Expected: {expected_actions[i]}")
        print(f"  Bottleneck: {predicted_bottlenecks[i]:12} | Expected: {expected_bottlenecks[i]}")
        
        # Mark correct/incorrect
        risk_correct = "✅" if predicted_risks[i] == expected_risks[i] else "❌"
        action_correct = "✅" if predicted_actions[i] == expected_actions[i] else "❌"
        bottleneck_correct = "✅" if predicted_bottlenecks[i] == expected_bottlenecks[i] else "❌"
        print(f"  Status:     {risk_correct} {action_correct} {bottleneck_correct}")
    
    # Save detailed results
    results = {
        'risk_accuracy': risk_accuracy,
        'action_accuracy': action_accuracy,
        'bottleneck_accuracy': bottleneck_accuracy,
        'overall_accuracy': overall_accuracy,
        'total_events': len(predicted_risks),
        'predictions': [
            {
                'predicted_risk': pred_r,
                'expected_risk': exp_r,
                'predicted_action': pred_a,
                'expected_action': exp_a,
                'predicted_bottleneck': pred_b,
                'expected_bottleneck': exp_b
            }
            for pred_r, exp_r, pred_a, exp_a, pred_b, exp_b in 
            zip(predicted_risks, expected_risks, predicted_actions, expected_actions, 
                predicted_bottlenecks, expected_bottlenecks)
        ]
    }
    
    with open('./validation_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Detailed results saved to: validation_results.json")
    
    # Performance interpretation
    print("\n" + "="*50)
    print("PERFORMANCE INTERPRETATION")
    print("="*50)
    
    if overall_accuracy >= 0.9:
        print("🟢 EXCELLENT: Model is highly accurate!")
    elif overall_accuracy >= 0.8:
        print("🟡 GOOD: Model performance is acceptable")
    elif overall_accuracy >= 0.7:
        print("🟠 FAIR: Model needs improvement")
    else:
        print("🔴 POOR: Model requires significant tuning")
    
    print(f"\nModel is making correct predictions {overall_accuracy:.1%} of the time")
    
    return results

def test_single_prediction():
    """Test a single prediction for debugging"""
    print("Testing single prediction...")
    
    # Create sample event data
    sample_event = {
        'crowd_outside': 150,
        'transport_arrival_next_10min': 80,
        'crowd_growth_rate': 25.5,
        'queue_data': {'GateA': 120, 'GateB': 80, 'GateC': 0, 'GateD': 0},
        'heatmap_data': {'SectionA': 100, 'SectionB': 80, 'SectionC': 0, 'SectionD': 0, 'Food Court': 50, 'Toilet': 20},
        'weather_condition': 'Clear',
        'scenario_phase': 'entry_rush',
        'parking_occupancy_percent': 45.0,
        'staff_security': 7,
        'staff_food': 3,
        'staff_medical': 2
    }
    
    # Get prediction
    predictor = SimplePredictor()
    prediction = predictor.predict(sample_event)
    
    print("Sample Event Data:")
    print(f"  Crowd Outside: {sample_event['crowd_outside']}")
    print(f"  Gate A Queue: {sample_event['queue_data']['GateA']}")
    print(f"  Weather: {sample_event['weather_condition']}")
    print(f"  Phase: {sample_event['scenario_phase']}")
    
    print("\nPrediction Results:")
    print(f"  Risk Level: {prediction['risk_level']}")
    print(f"  Bottleneck: {prediction['bottleneck_prediction']}")
    print(f"  Action: {prediction['recommended_action']}")
    print(f"  Confidence: {prediction['confidence_score']:.2%}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        test_single_prediction()
    else:
        validate_live_predictions()