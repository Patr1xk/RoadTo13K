import json
import boto3
import os

# Initialize AWS services
dynamodb = boto3.resource('dynamodb')
sns = boto3.client('sns')
sagemaker_runtime = boto3.client('sagemaker-runtime')

# DynamoDB tables
crowd_table = dynamodb.Table('crowd_simulation')
live_events_table = dynamodb.Table('crowd_live_events')

# SNS topic for alerts
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN')

def lambda_handler(event, context):
    """Main Lambda handler for crowd management API"""
    
    http_method = event['httpMethod']
    resource = event['resource']
    path_params = event.get('pathParameters', {})
    
    try:
        if resource == '/events' and http_method == 'POST':
            return create_event(event)
        elif resource == '/events' and http_method == 'GET':
            return get_all_events()
        elif resource == '/events/{event_id}' and http_method == 'GET':
            return get_event(path_params['event_id'])
        elif resource == '/events/{event_id}' and http_method == 'PUT':
            return update_event(path_params['event_id'], event)
        elif resource == '/events/{event_id}' and http_method == 'DELETE':
            return delete_event(path_params['event_id'])
        elif resource == '/events/live' and http_method == 'GET':
            return get_live_events()
        elif resource == '/events/predict' and http_method == 'POST':
            return predict_crowd_risk(event)
        else:
            return error_response(404, 'Endpoint not found')
            
    except Exception as e:
        return error_response(500, str(e))

def create_event(event):
    """Create new crowd event"""
    body = json.loads(event['body'])
    
    # Store in DynamoDB
    crowd_table.put_item(Item=body)
    
    # Check if alert needed
    if body.get('risk_level') in ['High', 'Critical']:
        send_alert(body)
    
    return success_response({
        'message': 'Event created successfully',
        'event_id': body['event_id']
    })

def get_event(event_id):
    """Get specific event"""
    response = crowd_table.get_item(Key={'event_id': event_id})
    
    if 'Item' not in response:
        return error_response(404, 'Event not found')
    
    return success_response(response['Item'])

def get_all_events():
    """Get all events"""
    response = crowd_table.scan()
    return success_response(response.get('Items', []))

def update_event(event_id, event):
    """Update existing event"""
    body = json.loads(event['body'])
    
    # Build update expression
    update_expr = "SET "
    expr_values = {}
    
    for key, value in body.items():
        if key != 'event_id':
            update_expr += f"{key} = :{key}, "
            expr_values[f":{key}"] = value
    
    update_expr = update_expr.rstrip(", ")
    
    crowd_table.update_item(
        Key={'event_id': event_id},
        UpdateExpression=update_expr,
        ExpressionAttributeValues=expr_values
    )
    
    return success_response({'message': 'Event updated successfully'})

def delete_event(event_id):
    """Delete event"""
    crowd_table.delete_item(Key={'event_id': event_id})
    return success_response({'message': 'Event deleted successfully'})

def get_live_events():
    """Get live events"""
    response = live_events_table.scan()
    return success_response(response.get('Items', []))

def predict_crowd_risk(event):
    """Use SageMaker to predict crowd risk (no S3 bucket needed)"""
    body = json.loads(event['body'])
    
    try:
        # Prepare data for SageMaker
        features = [
            body.get('crowd_outside', 0),
            body.get('transport_arrival_next_10min', 0),
            body.get('crowd_growth_rate', 0),
            body.get('gate_a_queue', 0),
            body.get('gate_b_queue', 0),
            body.get('gate_c_queue', 0),
            body.get('gate_d_queue', 0),
            body.get('section_a', 0),
            body.get('section_b', 0),
            body.get('section_c', 0),
            body.get('section_d', 0),
            body.get('food_court', 0),
            body.get('toilet', 0),
            body.get('parking_occupancy_percent', 0),
            body.get('staff_security', 5),
            body.get('staff_food', 3),
            body.get('staff_medical', 2)
        ]
        
        # Call SageMaker endpoint
        response = sagemaker_runtime.invoke_endpoint(
            EndpointName='crowd-management-endpoint',
            ContentType='application/json',
            Body=json.dumps([features])
        )
        
        prediction = json.loads(response['Body'].read().decode())
        
        return success_response({
            'prediction': prediction,
            'risk_level': map_prediction_to_risk(prediction[0])
        })
        
    except Exception as e:
        # Fallback to rule-based prediction
        risk_level = calculate_risk_level(body)
        return success_response({
            'prediction': 'rule-based',
            'risk_level': risk_level,
            'note': 'SageMaker unavailable, using fallback'
        })

def send_alert(event_data):
    """Send SNS alert for high-risk events"""
    if not SNS_TOPIC_ARN:
        return
    
    message = {
        'event_id': event_data['event_id'],
        'risk_level': event_data.get('risk_level'),
        'timestamp': event_data['timestamp'],
        'crowd_outside': event_data.get('crowd_outside', 0)
    }
    
    sns.publish(
        TopicArn=SNS_TOPIC_ARN,
        Message=json.dumps(message),
        Subject=f"Crowd Alert: {event_data.get('risk_level')} Risk Level"
    )

def calculate_risk_level(data):
    """Rule-based risk calculation"""
    crowd = data.get('crowd_outside', 0)
    total_queue = sum([
        data.get('gate_a_queue', 0),
        data.get('gate_b_queue', 0),
        data.get('gate_c_queue', 0),
        data.get('gate_d_queue', 0)
    ])
    
    if crowd > 400 or total_queue > 300:
        return 'Critical'
    elif crowd > 200 or total_queue > 150:
        return 'High'
    elif crowd > 100 or total_queue > 75:
        return 'Medium'
    else:
        return 'Low'

def map_prediction_to_risk(prediction):
    """Map ML prediction to risk level"""
    risk_levels = ['Low', 'Medium', 'High', 'Critical']
    return risk_levels[min(int(prediction), len(risk_levels) - 1)]

def success_response(data):
    """Return success response"""
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key'
        },
        'body': json.dumps(data, default=str)
    }

def error_response(status_code, message):
    """Return error response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message})
    }