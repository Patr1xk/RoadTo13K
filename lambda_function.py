

import boto3
import json
import random
from datetime import datetime, timezone, timedelta

def get_base_event(scenario_type):
    if scenario_type == 'concert_entry_rush':
        return {
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
    elif scenario_type == 'stadium_exit_wave':
        return {
            'event_type': 'Football Match',
            'venue': 'Bukit Jalil National Stadium',
            'expected_crowd_size': 50000,
            'scenario_phase': 'exit_start',
            'weather_condition': 'Clear',
            'crowd_outside': 0,
            'transport_arrival_next_10min': 200,
            'crowd_growth_rate': -85.0,
            'queue_data': {'GateA': 0, 'GateB': 0, 'GateC': 0, 'GateD': 0},
            'heatmap_data': {'SectionA': 2500, 'SectionB': 2800, 'SectionC': 2600, 'SectionD': 2400, 'Food Court': 150, 'Toilet': 200},
            'parking_occupancy_percent': 95.0,
            'staff_security': 25,
            'staff_food': 15,
            'staff_medical': 8
        }
    elif scenario_type == 'festival_congestion':
        return {
            'event_type': 'Cultural Festival',
            'venue': 'Batu Caves / Central Market',
            'expected_crowd_size': 15000,
            'scenario_phase': 'event_active',
            'weather_condition': random.choice(['Clear', 'Cloudy', 'Light_Rain']),
            'crowd_outside': 500,
            'transport_arrival_next_10min': 300,
            'crowd_growth_rate': 60.0,
            'queue_data': {'GateA': 100, 'GateB': 80, 'GateC': 60, 'GateD': 40},
            'heatmap_data': {'SectionA': 400, 'SectionB': 350, 'SectionC': 300, 'SectionD': 250, 'Food Court': 120, 'Toilet': 60},
            'parking_occupancy_percent': 70.0,
            'staff_security': 18,
            'staff_food': 10,
            'staff_medical': 6
        }
    else:
        # Default to concert_entry_rush
        return get_base_event('concert_entry_rush')

def get_dynamic_phase(scenario_type, counter):
    if scenario_type == 'concert_entry_rush':
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
    elif scenario_type == 'stadium_exit_wave':
        if counter <= 10:
            return 'exit_start'
        elif counter <= 30:
            return 'exit_wave'
        else:
            return 'exit_complete'
    elif scenario_type == 'festival_congestion':
        if counter <= 10:
            return 'event_active'
        elif counter <= 20:
            return 'peak_congestion'
        else:
            return 'event_winding_down'
    else:
        return 'event_active'

def generate_event(scenario_type, counter):
    event = get_base_event(scenario_type)
    # Add event_id and timestamp
    event['event_id'] = f"LIVE_{scenario_type[:3].upper()}_{counter:04d}"
    event['timestamp'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
    # Apply scenario-specific crowd dynamics
    multiplier = random.uniform(0.8, 1.2)
    for key in ['crowd_outside', 'transport_arrival_next_10min']:
        if key in event:
            event[key] = int(event[key] * multiplier)
    # Dynamic queue variations
    for gate, base_queue in event['queue_data'].items():
        variation = random.uniform(0.7, 1.4)
        event['queue_data'][gate] = max(0, int(base_queue * variation))
    # Evolve scenario phase
    event['scenario_phase'] = get_dynamic_phase(scenario_type, counter)
    # Add risk and action
    event['risk_level'] = random.choice(['Low', 'Medium', 'High'])
    event['recommended_action'] = random.choice(['monitor_only', 'increase_security', 'crowd_control_measures'])
    event['details'] = f'Simulated by Lambda ({scenario_type})'
    return event

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('crowd_live_events')

    http_method = event.get('httpMethod', 'POST')
    path = event.get('path', '/run-demo')

    # Default scenario
    scenario_type = 'concert_entry_rush'
    # Allow scenario_type to be passed in POST body
    if http_method == 'POST' and '/run-demo' in path:
        try:
            body = event.get('body')
            if body:
                if isinstance(body, str):
                    body = json.loads(body)
                scenario_type = body.get('scenario_type', scenario_type)
        except Exception:
            pass
        events = []
        for i in range(1, 21):
            event_item = generate_event(scenario_type, i)
            table.put_item(Item=event_item)
            events.append(event_item)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'message': f'Live simulation batch triggered for {scenario_type}', 'events': events})
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
