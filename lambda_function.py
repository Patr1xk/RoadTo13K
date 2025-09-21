import boto3
import json
import uuid
import random
from datetime import datetime, timezone

def generate_event(event_type, phase, venue, crowd_size):
    return {
        'event_id': str(uuid.uuid4()),
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'event_type': event_type,
        'venue': venue,
        'scenario_phase': phase,
        'expected_crowd_size': crowd_size,
        'risk_level': random.choice(['Low', 'Medium', 'High']),
        'recommended_action': random.choice(['monitor_only', 'increase_security', 'crowd_control_measures']),
        'queue_data': {
            'GateA': random.randint(10, 100),
            'GateB': random.randint(10, 100),
            'GateC': random.randint(10, 100),
            'GateD': random.randint(10, 100)
        },
        'heatmap_data': {
            'SectionA': random.randint(50, 500),
            'SectionB': random.randint(50, 500),
            'SectionC': random.randint(50, 500),
            'SectionD': random.randint(50, 500),
            'Food Court': random.randint(10, 100),
            'Toilet': random.randint(5, 50)
        },
        'details': 'Simulated by Lambda'
    }

def lambda_handler(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('crowd_live_events')

    # Parse HTTP method and path if coming from API Gateway
    http_method = event.get('httpMethod', 'POST')
    path = event.get('path', '/run-demo')

    if http_method == 'POST' and '/run-demo' in path:
        # Simulate a batch of live events (e.g., 10 events)
        phases = ['pre_event', 'peak_entry', 'event_ongoing', 'exit_wave']
        event_type = 'Concert'
        venue = 'KL Convention Centre'
        crowd_size = 8000
        events = []
        for i in range(10):
            phase = phases[i % len(phases)]
            event_item = generate_event(event_type, phase, venue, crowd_size)
            table.put_item(Item=event_item)
            events.append(event_item)
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'success': True, 'message': 'Live simulation batch triggered', 'events': events})
        }

    elif http_method == 'GET' and '/evaluation' in path:
        # Return evaluation metrics (e.g., count of events, risk distribution)
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
