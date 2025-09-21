#!/usr/bin/env python3
"""
Test all granted SageMaker AI models for Malaysian crowd control
🇲🇾 Tests: Titan Express, Titan Lite, OpenAI GPT-OSS-120B, OpenAI GPT-OSS-20B
"""

import os
import json
import boto3
from datetime import datetime

# Load AWS credentials
from dotenv import load_dotenv
load_dotenv('config/.env')

# Test sample data
SAMPLE_CROWD_DATA = {
    "location": "KLCC Twin Towers",
    "event_type": "New Year Countdown", 
    "crowd_density": 0.85,
    "weather": "Clear night",
    "time": "23:45",
    "entry_points": 6,
    "exit_points": 4,
    "security_level": "high",
    "estimated_attendance": 45000
}

def test_granted_models():
    """Test all granted models one by one"""
    print("🇲🇾 TESTING ALL GRANTED SAGEMAKER AI MODELS")
    print("=" * 60)
    
    # Initialize Bedrock client
    bedrock = boto3.client(
        'bedrock-runtime',
        region_name='us-east-1',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
    )
    
    # Test data
    prompt = f"""Malaysian Crowd Control AI Analysis for {SAMPLE_CROWD_DATA['location']}:

Event: {SAMPLE_CROWD_DATA['event_type']}
Crowd Density: {SAMPLE_CROWD_DATA['crowd_density']} (85%)
Weather: {SAMPLE_CROWD_DATA['weather']}
Time: {SAMPLE_CROWD_DATA['time']}
Estimated Attendance: {SAMPLE_CROWD_DATA['estimated_attendance']:,}

Please analyze this Malaysian crowd situation and respond with a JSON structure containing:
- risk_assessment (risk_level, risk_score, confidence)
- predictions (bottleneck_probability, crowd_flow_status, estimated_wait_time)
- recommendations (immediate_action, crowd_management, preventive_measures)
- malaysian_insights (local_considerations, communication_strategy, cultural_factors)

Focus on Malaysian crowd behavior, cultural factors, and local emergency protocols."""

    models_to_test = [
        {
            'name': 'Amazon Titan Text Express',
            'id': 'amazon.titan-text-express-v1',
            'body_format': 'titan'
        },
        {
            'name': 'Amazon Titan Text Lite', 
            'id': 'amazon.titan-text-lite-v1',
            'body_format': 'titan'
        },
        {
            'name': 'OpenAI GPT-OSS-120B',
            'id': 'openai.gpt-oss-120b-1:0',
            'body_format': 'openai'
        },
        {
            'name': 'OpenAI GPT-OSS-20B',
            'id': 'openai.gpt-oss-20b-1:0', 
            'body_format': 'openai'
        }
    ]
    
    results = {}
    
    for model in models_to_test:
        print(f"\n🤖 Testing {model['name']}...")
        print("-" * 50)
        
        try:
            # Format request body based on model type
            if model['body_format'] == 'titan':
                body = json.dumps({
                    "inputText": prompt,
                    "textGenerationConfig": {
                        "maxTokenCount": 1500,
                        "temperature": 0.1,
                        "topP": 0.9,
                        "stopSequences": []
                    }
                })
            elif model['body_format'] == 'openai':
                body = json.dumps({
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": 1500,
                    "temperature": 0.1,
                    "top_p": 0.9
                })
            
            # Make API call
            response = bedrock.invoke_model(
                modelId=model['id'],
                body=body
            )
            
            # Parse response
            result = json.loads(response['body'].read())
            
            if model['body_format'] == 'titan':
                ai_response = result['results'][0]['outputText']
            elif model['body_format'] == 'openai':
                ai_response = result['choices'][0]['message']['content']
            
            # Store result
            results[model['name']] = {
                'status': 'SUCCESS ✅',
                'model_id': model['id'],
                'response_length': len(ai_response),
                'response_preview': ai_response[:200] + "..." if len(ai_response) > 200 else ai_response,
                'timestamp': datetime.now().isoformat()
            }
            
            print(f"✅ {model['name']} - SUCCESS!")
            print(f"📝 Response length: {len(ai_response)} characters")
            print(f"🔍 Preview: {ai_response[:150]}...")
            
        except Exception as e:
            results[model['name']] = {
                'status': 'FAILED ❌',
                'model_id': model['id'],
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
            print(f"❌ {model['name']} - FAILED!")
            print(f"💥 Error: {str(e)}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TESTING SUMMARY")
    print("=" * 60)
    
    successful = 0
    for model_name, result in results.items():
        status = result['status']
        print(f"{model_name}: {status}")
        if 'SUCCESS' in status:
            successful += 1
    
    print(f"\n🎯 SUCCESS RATE: {successful}/{len(models_to_test)} models working")
    
    # Save results
    with open('granted_models_test_results.json', 'w') as f:
        json.dump({
            'test_timestamp': datetime.now().isoformat(),
            'total_models_tested': len(models_to_test),
            'successful_models': successful,
            'test_data': SAMPLE_CROWD_DATA,
            'results': results
        }, f, indent=2)
    
    print(f"💾 Results saved to: granted_models_test_results.json")
    
    if successful > 0:
        print(f"\n🚀 YOUR SAGEMAKER AI SYSTEM HAS {successful} WORKING MODELS!")
        print("🇲🇾 Ready for Malaysian crowd control deployment!")
    else:
        print("\n⚠️  No models working - check credentials and permissions")

if __name__ == "__main__":
    test_granted_models()