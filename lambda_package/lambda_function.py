import boto3
import json
from datetime import datetime

def lambda_handler(event, context):
    # Example: Simulate a live event and write to DynamoDB
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('crowd_live_events')
    
    # Simulate a single event (customize as needed)
    event_item = {
        'event_id': f'lambda-{datetime.utcnow().isoformat()}',
        'timestamp': datetime.utcnow().isoformat(),
        'venue_type': event.get('venue_type', 'concert_hall'),
        'risk_level': 'Low',
        'recommended_action': 'monitor_only',
        'details': 'Simulated by Lambda',
    }
    table.put_item(Item=event_item)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'message': 'Live simulation triggered', 'event': event_item})
    }
