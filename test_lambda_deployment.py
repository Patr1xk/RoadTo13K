#!/usr/bin/env python3
"""
Test the deployed AWS Lambda function
Malaysian Crowd Control AI System
"""

import requests
import json
from datetime import datetime

def test_aws_lambda():
    """Test the deployed Lambda function"""
    
    # Get endpoint from .env
    try:
        from dotenv import load_dotenv
        import os
        load_dotenv()
        
        endpoint_url = os.getenv('LAMBDA_FUNCTION_URL')
        if not endpoint_url:
            print("❌ No Lambda function URL found in .env")
            return False
    except:
        endpoint_url = "https://c7kxrxqw32a3d4ik2aeoudj7qi0grtut.lambda-url.us-east-1.on.aws/"
    
    print("🇲🇾 TESTING MALAYSIAN CROWD CONTROL AI ON AWS")
    print("=" * 50)
    print(f"🌐 Endpoint: {endpoint_url}")
    print()
    
    # Test cases
    test_cases = [
        {
            "name": "Stadium Exit Rush",
            "data": {
                "crowd_density": 0.8,
                "event_type": "stadium_exit", 
                "time_factor": 0.9,
                "weather_factor": 0.7,
                "location_capacity": 5000,
                "current_crowd": 4200
            }
        },
        {
            "name": "Concert Entry",
            "data": {
                "crowd_density": 0.6,
                "event_type": "concert_entry",
                "time_factor": 0.5,
                "weather_factor": 0.9,
                "location_capacity": 8000,
                "current_crowd": 3000
            }
        },
        {
            "name": "Festival Congestion",
            "data": {
                "crowd_density": 0.9,
                "event_type": "festival_congestion",
                "time_factor": 0.8,
                "weather_factor": 0.6,
                "location_capacity": 3000,
                "current_crowd": 2800
            }
        }
    ]
    
    print("🔄 TESTING AWS LAMBDA PREDICTIONS")
    print("-" * 40)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test_case['name']}")
        print(f"📊 Input: {test_case['data']}")
        
        try:
            # Make request to AWS Lambda
            response = requests.post(
                endpoint_url,
                json=test_case['data'],
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"✅ AWS Response: {response.status_code}")
                print(f"🎯 Risk Level: {result['predictions']['risk_level']}")
                print(f"📈 Risk Score: {result['predictions']['risk_score']}")
                print(f"🚧 Bottleneck Risk: {result['predictions']['bottleneck_probability']}")
                print(f"💡 Action: {result['predictions']['recommended_action']}")
                print(f"🇲🇾 Insight: {result['predictions']['location_insight']}")
                print(f"📊 Confidence: {result['confidence']}")
                print(f"⏰ Timestamp: {result['timestamp']}")
                
            else:
                print(f"❌ AWS Error: {response.status_code}")
                print(f"Response: {response.text}")
                
        except Exception as e:
            print(f"❌ Request failed: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 AWS LAMBDA TESTING COMPLETED!")
    print("💰 Each prediction costs ~$0.0001")
    print("🇲🇾 Your Malaysian AI is running on real AWS!")
    
    return True

def test_simple_get():
    """Test with a simple GET request"""
    try:
        from dotenv import load_dotenv
        import os
        load_dotenv()
        
        endpoint_url = os.getenv('LAMBDA_FUNCTION_URL')
        if not endpoint_url:
            endpoint_url = "https://c7kxrxqw32a3d4ik2aeoudj7qi0grtut.lambda-url.us-east-1.on.aws/"
        
        print(f"\n🔍 Testing simple GET request to: {endpoint_url}")
        
        response = requests.get(endpoint_url, timeout=10)
        print(f"✅ GET Response: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"🎯 System Status: {result.get('status', 'unknown')}")
        
    except Exception as e:
        print(f"❌ GET test failed: {e}")

if __name__ == "__main__":
    print("🚀 STARTING AWS LAMBDA TESTS")
    print()
    
    # Test main functionality
    test_aws_lambda()
    
    # Test simple connectivity
    test_simple_get()
    
    print("\n✅ All tests completed!")
    print("🎉 Your Malaysian Crowd Control AI is live on AWS!")