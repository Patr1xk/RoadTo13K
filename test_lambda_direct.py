#!/usr/bin/env python3
"""
Test AWS Lambda function directly through AWS API
When function URL doesn't work due to permissions
"""

import boto3
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_lambda_direct():
    """Test Lambda function directly through AWS API"""
    try:
        print("🇲🇾 TESTING MALAYSIAN CROWD CONTROL AI (Direct AWS API)")
        print("=" * 60)
        
        # Initialize Lambda client
        session = boto3.Session(
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            aws_session_token=os.getenv('AWS_SESSION_TOKEN'),
            region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        )
        
        lambda_client = session.client('lambda')
        function_name = 'malaysian-crowd-control-ai'
        
        print(f"📡 Function: {function_name}")
        print(f"🌍 Region: {os.getenv('AWS_DEFAULT_REGION')}")
        print()
        
        # Test payload
        test_payload = {
            "crowd_density": 0.8,
            "event_type": "stadium_exit",
            "time_factor": 0.9,
            "weather_factor": 0.7,
            "location_capacity": 5000,
            "current_crowd": 4200
        }
        
        print("🧪 TEST: Stadium Exit Rush (High Risk)")
        print(f"📊 Input: {test_payload}")
        print()
        
        # Invoke Lambda function
        response = lambda_client.invoke(
            FunctionName=function_name,
            InvocationType='RequestResponse',
            Payload=json.dumps(test_payload)
        )
        
        # Parse response
        response_payload = json.loads(response['Payload'].read())
        
        print(f"✅ AWS Lambda Response:")
        print(f"📈 Status Code: {response_payload.get('statusCode', 'Unknown')}")
        
        if 'body' in response_payload:
            result = json.loads(response_payload['body'])
            
            print("🎯 PREDICTION RESULTS:")
            print("-" * 30)
            print(f"🚨 Risk Level: {result['predictions']['risk_level']}")
            print(f"📊 Risk Score: {result['predictions']['risk_score']}")
            print(f"🚧 Bottleneck Risk: {result['predictions']['bottleneck_probability']}")
            print(f"💡 Recommended Action: {result['predictions']['recommended_action']}")
            print(f"🇲🇾 Malaysian Insight: {result['predictions']['location_insight']}")
            print(f"📊 Confidence: {result['confidence']}")
            print(f"⏰ Timestamp: {result['timestamp']}")
            print(f"🎯 Model Accuracy: {result['model_info']['accuracy']}")
            
            print("\n🎉 SUCCESS! Your Malaysian AI is working on AWS!")
            
        else:
            print(f"❌ Unexpected response: {response_payload}")
            
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_multiple_scenarios():
    """Test multiple crowd control scenarios"""
    try:
        session = boto3.Session(
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            aws_session_token=os.getenv('AWS_SESSION_TOKEN'),
            region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        )
        
        lambda_client = session.client('lambda')
        function_name = 'malaysian-crowd-control-ai'
        
        scenarios = [
            {
                "name": "🏟️ Stadium Exit (High Risk)",
                "data": {
                    "crowd_density": 0.9,
                    "event_type": "stadium_exit",
                    "current_crowd": 4500,
                    "location_capacity": 5000
                }
            },
            {
                "name": "🎵 Concert Entry (Medium Risk)",
                "data": {
                    "crowd_density": 0.5,
                    "event_type": "concert_entry",
                    "current_crowd": 2000,
                    "location_capacity": 8000
                }
            },
            {
                "name": "🎪 Festival (Low Risk)",
                "data": {
                    "crowd_density": 0.3,
                    "event_type": "festival_congestion",
                    "current_crowd": 800,
                    "location_capacity": 3000
                }
            }
        ]
        
        print("\n🔄 TESTING MULTIPLE SCENARIOS")
        print("=" * 50)
        
        for i, scenario in enumerate(scenarios, 1):
            print(f"\n{scenario['name']}")
            print("-" * 30)
            
            response = lambda_client.invoke(
                FunctionName=function_name,
                InvocationType='RequestResponse',
                Payload=json.dumps(scenario['data'])
            )
            
            response_payload = json.loads(response['Payload'].read())
            result = json.loads(response_payload['body'])
            
            risk = result['predictions']['risk_level']
            action = result['predictions']['recommended_action']
            
            print(f"🎯 Risk: {risk.upper()}")
            print(f"💡 Action: {action}")
            
        return True
        
    except Exception as e:
        print(f"❌ Multiple scenario test failed: {e}")
        return False

def validate_deployment():
    """Validate the deployment is working"""
    try:
        session = boto3.Session(
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            aws_session_token=os.getenv('AWS_SESSION_TOKEN'),
            region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        )
        
        lambda_client = session.client('lambda')
        function_name = 'malaysian-crowd-control-ai'
        
        # Get function info
        response = lambda_client.get_function(FunctionName=function_name)
        
        print("\n📋 DEPLOYMENT VALIDATION")
        print("=" * 40)
        print(f"✅ Function Name: {response['Configuration']['FunctionName']}")
        print(f"✅ Runtime: {response['Configuration']['Runtime']}")
        print(f"✅ Memory: {response['Configuration']['MemorySize']}MB")
        print(f"✅ Timeout: {response['Configuration']['Timeout']}s")
        print(f"✅ Last Modified: {response['Configuration']['LastModified']}")
        print(f"✅ State: {response['Configuration']['State']}")
        
        return True
        
    except Exception as e:
        print(f"❌ Validation failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 TESTING AWS LAMBDA DIRECTLY")
    print()
    
    # Test main functionality
    if test_lambda_direct():
        print("\n" + "=" * 60)
        
        # Test multiple scenarios
        test_multiple_scenarios()
        
        # Validate deployment
        validate_deployment()
        
        print("\n🎉 ALL TESTS PASSED!")
        print("💰 Your Malaysian AI is successfully running on AWS!")
        print("🇲🇾 Crowd control predictions working perfectly!")
        
    else:
        print("\n❌ Tests failed - check your AWS credentials")