#!/usr/bin/env python3
"""
AWS SageMaker AI (Bedrock) for Crowd Control
Uses foundation models - NO S3 required!
"""

import boto3
import json
import os
from dotenv import load_dotenv

load_dotenv()

class SageMakerAICrowdControl:
    def __init__(self):
        """Initialize SageMaker AI client"""
        self.session = boto3.Session(
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            aws_session_token=os.getenv('AWS_SESSION_TOKEN'),
            region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
        )
        
        # SageMaker AI (Bedrock) client - NO S3 needed
        self.bedrock = self.session.client('bedrock-runtime')
    
    def predict_crowd_control(self, crowd_data):
        """Use SageMaker AI for crowd control prediction"""
        
        # Create prompt for foundation model
        prompt = f"""
        You are a Malaysian crowd control AI system. Analyze this crowd situation:
        
        Crowd Density: {crowd_data.get('crowd_density', 0.5)}
        Event Type: {crowd_data.get('event_type', 'general')}
        Current Crowd: {crowd_data.get('current_crowd', 500)}
        Location Capacity: {crowd_data.get('location_capacity', 1000)}
        Time Factor: {crowd_data.get('time_factor', 0.5)}
        Weather Factor: {crowd_data.get('weather_factor', 0.8)}
        
        Provide a JSON response with:
        - risk_level (low/medium/high)
        - risk_score (0-1)
        - bottleneck_probability (0-1)
        - recommended_action
        - malaysian_specific_insight
        
        Response format: {{"risk_level": "...", "risk_score": 0.x, ...}}
        """
        
        try:
            # Use Claude/LLaMA model on SageMaker AI
            response = self.bedrock.invoke_model(
                modelId='anthropic.claude-3-haiku-20240307-v1:0',  # or other available model
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 500,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                })
            )
            
            result = json.loads(response['body'].read())
            ai_prediction = result['content'][0]['text']
            
            return {
                "status": "success",
                "prediction": ai_prediction,
                "model": "SageMaker AI (Bedrock)",
                "no_s3_required": True
            }
            
        except Exception as e:
            return {
                "status": "error", 
                "error": str(e),
                "fallback": "SageMaker AI not available with current credentials"
            }

def test_sagemaker_ai():
    """Test if SageMaker AI works without S3"""
    ai_system = SageMakerAICrowdControl()
    
    test_data = {
        "crowd_density": 0.8,
        "event_type": "stadium_exit",
        "current_crowd": 4500,
        "location_capacity": 5000
    }
    
    result = ai_system.predict_crowd_control(test_data)
    print("🧠 SageMaker AI Test:")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_sagemaker_ai()