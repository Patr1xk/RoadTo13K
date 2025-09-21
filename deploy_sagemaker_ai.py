#!/usr/bin/env python3
"""
AWS SageMaker AI (Bedrock) Deployment
For use with PERMANENT credentials (AKIA...)
No S3 required - uses foundation models
"""

import boto3
import json
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

class SageMakerAIDeployer:
    def __init__(self):
        """Initialize SageMaker AI with permanent credentials"""
        try:
            # Check if credentials are permanent
            access_key = os.getenv('AWS_ACCESS_KEY_ID', '')
            if access_key.startswith('ASIA'):
                print("⚠️  WARNING: Using temporary credentials (ASIA...)")
                print("💡 SageMaker AI needs permanent credentials (AKIA...)")
                print("🔧 Get permanent keys from AWS Console → IAM → Users")
                print()
            
            self.session = boto3.Session(
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                aws_session_token=os.getenv('AWS_SESSION_TOKEN'),  # Can be None for permanent keys
                region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
            )
            
            # SageMaker AI (Bedrock) - NO S3 needed!
            self.bedrock = self.session.client('bedrock-runtime')
            self.bedrock_models = self.session.client('bedrock')
            
            print("✅ SageMaker AI client initialized")
            
        except Exception as e:
            print(f"❌ Error initializing SageMaker AI: {e}")
            raise

    def check_available_models(self):
        """Check which foundation models are available"""
        try:
            print("🔍 Checking available SageMaker AI models...")
            
            response = self.bedrock_models.list_foundation_models()
            models = response.get('modelSummaries', [])
            
            print(f"✅ Found {len(models)} available models:")
            
            available_models = []
            for model in models[:10]:  # Show first 10
                model_id = model['modelId']
                model_name = model.get('modelName', 'Unknown')
                provider = model.get('providerName', 'Unknown')
                
                print(f"   📦 {model_name} ({provider}) - {model_id}")
                available_models.append(model_id)
            
            return available_models
            
        except Exception as e:
            print(f"❌ Error checking models: {e}")
            return []

    def create_crowd_control_prompt(self, crowd_data):
        """Create optimized prompt for crowd control AI"""
        
        prompt = f"""You are an expert Malaysian crowd control AI system. Analyze this crowd situation and provide actionable recommendations.

CROWD SITUATION:
- Crowd Density: {crowd_data.get('crowd_density', 0.5)} (0=empty, 1=packed)
- Event Type: {crowd_data.get('event_type', 'general')}
- Current Crowd: {crowd_data.get('current_crowd', 500)} people
- Location Capacity: {crowd_data.get('location_capacity', 1000)} people
- Time Factor: {crowd_data.get('time_factor', 0.5)} (0=off-peak, 1=peak)
- Weather Factor: {crowd_data.get('weather_factor', 0.8)} (0=bad, 1=good)

MALAYSIAN CONTEXT:
- Consider local crowd behavior patterns
- Account for cultural event dynamics
- Include language-appropriate guidance (English/Malay)

REQUIRED OUTPUT (JSON format only):
{{
  "risk_assessment": {{
    "risk_level": "low|medium|high",
    "risk_score": 0.85,
    "confidence": 0.92
  }},
  "predictions": {{
    "bottleneck_probability": 0.75,
    "crowd_flow_status": "stable|concerning|critical",
    "estimated_wait_time": "5-10 minutes"
  }},
  "recommendations": {{
    "immediate_action": "specific action to take now",
    "crowd_management": "how to manage current situation",
    "preventive_measures": "steps to prevent escalation"
  }},
  "malaysian_insights": {{
    "local_considerations": "Malaysian-specific factors",
    "communication_strategy": "How to communicate with crowd",
    "cultural_factors": "Relevant cultural considerations"
  }}
}}

Respond with ONLY the JSON, no additional text."""

        return prompt

    def predict_with_claude(self, crowd_data):
        """Use Claude model for crowd control prediction"""
        try:
            prompt = self.create_crowd_control_prompt(crowd_data)
            
            # Try Claude 3 Haiku (fast and cost-effective)
            response = self.bedrock.invoke_model(
                modelId='anthropic.claude-3-haiku-20240307-v1:0',
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 2000,
                    "temperature": 0.1,  # Low temperature for consistent predictions
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                })
            )
            
            result = json.loads(response['body'].read())
            ai_response = result['content'][0]['text']
            
            # Parse JSON response
            try:
                prediction = json.loads(ai_response)
                prediction['model_info'] = {
                    'model': 'Claude 3 Haiku',
                    'provider': 'Anthropic',
                    'type': 'SageMaker AI (Bedrock)',
                    'timestamp': datetime.now().isoformat()
                }
                return prediction
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    'error': 'Could not parse AI response',
                    'raw_response': ai_response,
                    'model': 'Claude 3 Haiku'
                }
                
        except Exception as e:
            return {
                'error': f'Claude prediction failed: {str(e)}',
                'fallback': 'Try different model or check permissions'
            }

    def predict_crowd_control(self, crowd_data):
        """Main prediction function"""
        print("🧠 SageMaker AI Crowd Control Prediction")
        print("-" * 50)
        
        # Try Claude
        print("🔄 Trying Claude 3 Haiku...")
        claude_result = self.predict_with_claude(crowd_data)
        
        if 'error' not in claude_result:
            print("✅ Claude prediction successful!")
            return claude_result
        
        print(f"❌ Claude failed: {claude_result.get('error', 'Unknown error')}")
        
        # All models failed
        return {
            'error': 'SageMaker AI models failed',
            'claude_error': claude_result.get('error'),
            'suggestion': 'Check model availability and permissions'
        }

    def deploy_sagemaker_ai_system(self):
        """Deploy complete SageMaker AI system"""
        print("🇲🇾 DEPLOYING SAGEMAKER AI CROWD CONTROL SYSTEM")
        print("=" * 60)
        print("💡 Uses foundation models - NO S3 required!")
        print("⚠️  Requires permanent AWS credentials (AKIA...)")
        print()
        
        # Check credentials
        access_key = os.getenv('AWS_ACCESS_KEY_ID', '')
        if access_key.startswith('ASIA'):
            print("❌ Cannot deploy with temporary credentials")
            print("🔧 Get permanent credentials first")
            return False
        
        # Check available models
        models = self.check_available_models()
        if not models:
            print("❌ No models available - check permissions")
            return False
        
        print()
        print("🚀 Testing SageMaker AI with sample data...")
        
        # Test prediction
        test_data = {
            "crowd_density": 0.8,
            "event_type": "stadium_exit",
            "current_crowd": 4500,
            "location_capacity": 5000,
            "time_factor": 0.9,
            "weather_factor": 0.7
        }
        
        result = self.predict_crowd_control(test_data)
        
        if 'error' not in result:
            print("🎉 SAGEMAKER AI DEPLOYMENT SUCCESSFUL!")
            print("✅ Foundation models working")
            print("✅ Malaysian crowd control ready")
            print("✅ Real AWS AI system active")
            
            # Display result
            print("\n📊 SAMPLE PREDICTION:")
            print(json.dumps(result, indent=2))
            
            return True
        else:
            print("❌ DEPLOYMENT FAILED")
            print(f"Error: {result.get('error')}")
            return False

def main():
    """Main deployment function"""
    try:
        deployer = SageMakerAIDeployer()
        success = deployer.deploy_sagemaker_ai_system()
        
        if success:
            print("\n🎉 SageMaker AI system deployed successfully!")
            print("💡 Your Malaysian crowd control AI is now powered by foundation models!")
        else:
            print("\n❌ Deployment failed - check credentials and permissions")
            
    except Exception as e:
        print(f"\n❌ Deployment error: {e}")

if __name__ == "__main__":
    main()