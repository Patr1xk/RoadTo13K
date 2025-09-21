# AWS Architecture for Crowd Management System

## Overview
This project now uses proper AWS services instead of FastAPI for production deployment.

## AWS Services Used

### 1. **API Gateway** 
- **Purpose**: REST API management and routing
- **Endpoints**:
  - `GET /events` - Get all events
  - `POST /events` - Create new event
  - `GET /events/{event_id}` - Get specific event
  - `PUT /events/{event_id}` - Update event
  - `DELETE /events/{event_id}` - Delete event
  - `GET /events/live` - Get live events
  - `POST /events/predict` - ML predictions

### 2. **Lambda Functions**
- **Function**: `crowd-events-handler`
- **File**: `backend/lambda_functions/crowd_events.py`
- **Purpose**: Handle all API requests, process data, integrate with other AWS services

### 3. **DynamoDB**
- **Tables**:
  - `crowd_simulation` - Main events data
  - `crowd_live_events` - Real-time events
- **Key**: `event_id` (String)

### 4. **SNS (Simple Notification Service)**
- **Topic**: `crowd-alerts`
- **Purpose**: Send alerts when risk level is High/Critical

### 5. **SageMaker**
- **Endpoint**: `crowd-management-endpoint`
- **Purpose**: ML predictions for crowd risk assessment
- **Training**: Uses local data upload (no S3 bucket required)
- **Fallback**: Rule-based predictions if SageMaker unavailable

### 6. **Data Storage**
- **Purpose**: SageMaker handles model storage internally
- **Training Data**: Uploaded directly to SageMaker (no S3 bucket setup needed)

## Deployment Steps

### 1. Deploy AWS Infrastructure
```bash
cd backend
python aws_deployment.py
```

### 2. Create API Gateway
```bash
python api_gateway_config.py
```

### 3. Deploy SageMaker Model
```bash
python deploy_sagemaker.py
```

## API Endpoints (AWS API Gateway)

Base URL: `https://{api-id}.execute-api.us-east-1.amazonaws.com/prod`

### Events Management
- **POST** `/events` - Create event
- **GET** `/events` - Get all events  
- **GET** `/events/{event_id}` - Get specific event
- **PUT** `/events/{event_id}` - Update event
- **DELETE** `/events/{event_id}` - Delete event

### Live Data
- **GET** `/events/live` - Get live events

### ML Predictions
- **POST** `/events/predict` - Get crowd risk prediction

## Request/Response Examples

### Create Event
```json
POST /events
{
  "event_id": "E001_T01",
  "timestamp": "2024-01-01T10:00:00Z",
  "scenario_phase": "entry_start",
  "weather_condition": "Clear",
  "crowd_outside": 200,
  "gate_a_queue": 50,
  "gate_b_queue": 30,
  "risk_level": "Medium"
}
```

### Predict Risk
```json
POST /events/predict
{
  "crowd_outside": 300,
  "transport_arrival_next_10min": 150,
  "crowd_growth_rate": 25.5,
  "gate_a_queue": 80,
  "gate_b_queue": 60,
  "gate_c_queue": 40,
  "gate_d_queue": 20,
  "section_a": 100,
  "section_b": 120,
  "section_c": 80,
  "section_d": 60,
  "food_court": 50,
  "toilet": 30,
  "parking_occupancy_percent": 75,
  "staff_security": 8,
  "staff_food": 5,
  "staff_medical": 3
}
```

## Architecture Benefits

### Scalability
- **Lambda**: Auto-scales based on requests
- **DynamoDB**: Handles high read/write loads
- **API Gateway**: Manages traffic and throttling

### Cost Efficiency
- **Pay-per-use**: Only pay for actual usage
- **No server management**: Serverless architecture

### Reliability
- **Multi-AZ**: Built-in redundancy
- **Managed services**: AWS handles maintenance

### Security
- **IAM roles**: Fine-grained permissions
- **API Gateway**: Built-in authentication/authorization
- **VPC**: Network isolation if needed

## Migration from FastAPI

### Old (FastAPI)
```python
# Direct database calls
@app.get("/events")
def get_events():
    return crowd_db.get_all_events()
```

### New (AWS Lambda)
```python
# Lambda handler with proper AWS integration
def lambda_handler(event, context):
    if event['resource'] == '/events' and event['httpMethod'] == 'GET':
        return get_all_events()
```

## Monitoring & Alerts

### CloudWatch
- Lambda function metrics
- API Gateway request/response metrics
- DynamoDB read/write capacity

### SNS Alerts
- Automatic alerts for High/Critical risk levels
- Email/SMS notifications to staff

## Cost Estimation

### Monthly Costs (approximate)
- **API Gateway**: $3.50 per million requests
- **Lambda**: $0.20 per million requests
- **DynamoDB**: $1.25 per million read/write requests
- **SNS**: $0.50 per million notifications
- **SageMaker**: $0.065 per hour for ml.t2.medium endpoint

## Next Steps

1. **Configure IAM Roles**: Set proper permissions
2. **Set up CloudWatch**: Monitor and logging
3. **Configure SNS**: Add email/SMS subscribers
4. **Test Endpoints**: Verify all functionality
5. **Frontend Integration**: Update frontend to use new API Gateway URLs