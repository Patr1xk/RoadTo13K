
import boto3
import json
import random
from datetime import datetime, timezone

def get_base_event(counter):
    # Use the concert_entry_rush scenario as default
    base_event = {
        'event_type': 'Concert',
        'venue': 'KL Convention Centre',
        'expected_crowd_size': 8000,
        'scenario_phase': 'entry_start',
        'weather_condition': random.choice(['Clear', 'Cloudy', 'Light_Rain']),
        'crowd_outside': 200,
        'transport_arrival_next_10min': 150,
        'crowd_growth_rate': 45.0,
        'queue_data': {'GateA': 50, 'GateB': 30, 'GateC': 20, 'GateD': 15},
        'heatmap_data': {'SectionA': 100, 'SectionB': 80, 'SectionC': 90, 'SectionD': 70, 'Food Court': 25, 'Toilet': 15},
        'parking_occupancy_percent': 45.0,
        'staff_security': 12,
        'staff_food': 6,
        'staff_medical': 4
    }
    # Generate unique event ID
    base_event['event_id'] = f"LIVE_CON_{counter:04d}"
    base_event['timestamp'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    return base_event

def get_dynamic_phase(counter):
    if counter <= 5:
        return 'pre_event'
    elif counter <= 15:
        return 'entry_start'
    elif counter <= 25:
        return 'entry_rush'
    elif counter <= 30:
        return 'entry_complete'
    else:
        return 'event_active'

def generate_event(counter):
    event = get_base_event(counter)
    # Apply scenario-specific crowd dynamics
    multiplier = 1.5 * random.uniform(0.8, 1.2)
    for key in ['crowd_outside', 'transport_arrival_next_10min']:
        if key in event:
            event[key] = int(event[key] * multiplier)
    # Dynamic queue variations
    for gate, base_queue in event['queue_data'].items():
        variation = random.uniform(0.7, 1.4)
        event['queue_data'][gate] = max(0, int(base_queue * variation))
    # Evolve scenario phase
    event['scenario_phase'] = get_dynamic_phase(counter)
    # Add risk and action
    event['risk_level'] = random.choice(['Low', 'Medium', 'High'])
    event['recommended_action'] = random.choice(['monitor_only', 'increase_security', 'crowd_control_measures'])
    event['details'] = 'Simulated by Lambda'
    return event

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('crowd_live_events')

    http_method = event.get('httpMethod', 'POST')
    path = event.get('path', '/run-demo')

    if http_method == 'POST' and '/run-demo' in path:
        # Simulate a batch of realistic live events (e.g., 20 events)
        events = []
        for i in range(1, 21):
            event_item = generate_event(i)
            table.put_item(Item=event_item)
            events.append(event_item)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'message': 'Live simulation batch triggered', 'events': events})
        }

    elif http_method == 'GET' and '/evaluation' in path:
        response = table.scan(Limit=50)
        items = response.get('Items', [])
        risk_counts = {'Low': 0, 'Medium': 0, 'High': 0}
        for item in items:
            risk = item.get('risk_level', 'Unknown')
            if risk in risk_counts:
                risk_counts[risk] += 1
        metrics = {
            'total_events': len(items),
            'risk_distribution': risk_counts,
            'recent_events': items[:5]
        }
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'metrics': metrics})
        }

    else:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'error': 'Invalid endpoint or method'})
        }
