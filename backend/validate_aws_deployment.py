#!/usr/bin/env python3
"""
🔍 AWS SAGEMAKER DEPLOYMENT VALIDATOR
====================================
Check if your AWS SageMaker endpoint is deployed and working
"""

import os
import json
import boto3
import time
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
# Load environment variables from config folder
load_dotenv('../config/.env')

class AWSDeploymentValidator:
    def __init__(self):
        """Initialize validator"""
        self.region = os.getenv('AWS_DEFAULT_REGION', 'ap-southeast-1')
        self.endpoint_name = os.getenv('SAGEMAKER_ENDPOINT_NAME', 'crowd-control-predictor')
        
        try:
            # Try to use credentials from .env first
            aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
            aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
            
            if aws_access_key and aws_secret_key:
                session = boto3.Session(
                    aws_access_key_id=aws_access_key,
                    aws_secret_access_key=aws_secret_key,
                    region_name=self.region
                )
                self.sagemaker = session.client('sagemaker')
                self.runtime = session.client('sagemaker-runtime')
                self.lambda_client = session.client('lambda')
                self.bedrock = session.client('bedrock')
                self.iam = session.client('iam')
                print(f"✅ AWS clients initialized using .env credentials")
            else:
                # Fallback to default AWS configuration
                self.sagemaker = boto3.client('sagemaker', region_name=self.region)
                self.runtime = boto3.client('sagemaker-runtime', region_name=self.region)
                self.lambda_client = boto3.client('lambda', region_name=self.region)
                self.bedrock = boto3.client('bedrock', region_name=self.region)
                self.iam = boto3.client('iam', region_name=self.region)
                print(f"✅ AWS clients initialized using aws configure")
                
        except Exception as e:
            print(f"❌ AWS client initialization failed: {e}")
            self.sagemaker = None
    
    def check_aws_credentials(self):
        """Check if AWS credentials are configured"""
        print("\n🔐 CHECKING AWS CREDENTIALS")
        print("-" * 30)
        
        try:
            sts = boto3.client('sts')
            identity = sts.get_caller_identity()
            
            print(f"✅ Account ID: {identity['Account']}")
            print(f"✅ User/Role: {identity['Arn'].split('/')[-1]}")
            print(f"✅ Region: {self.region}")
            return True
        except Exception as e:
            print(f"❌ Credentials error: {e}")
            print("\n🔧 Fix with:")
            print("   aws configure")
            return False
    
    def check_endpoint_status(self):
        """Check SageMaker endpoint status"""
        print("\n🚀 CHECKING SAGEMAKER ENDPOINT")
        print("-" * 30)
        
        try:
            response = self.sagemaker.describe_endpoint(
                EndpointName=self.endpoint_name
            )
            
            status = response['EndpointStatus']
            creation_time = response['CreationTime']
            instance_type = response['ProductionVariants'][0]['InstanceType']
            
            print(f"📍 Endpoint: {self.endpoint_name}")
            print(f"📊 Status: {status}")
            print(f"💻 Instance: {instance_type}")
            print(f"⏰ Created: {creation_time}")
            
            if status == 'InService':
                print("✅ Endpoint is READY for predictions!")
                return True
            elif status == 'Creating':
                print("⏳ Endpoint is still being created...")
                return False
            elif status == 'Failed':
                print("❌ Endpoint creation FAILED!")
                print(f"   Reason: {response.get('FailureReason', 'Unknown')}")
                return False
            else:
                print(f"⚠️  Endpoint status: {status}")
                return False
                
        except Exception as e:
            if 'ValidationException' in str(e):
                print("❌ Endpoint does not exist!")
                print("   Run: python backend/deploy_lambda_only.py")
            else:
                print(f"❌ Error checking endpoint: {e}")
            return False
    
    def check_lambda_functions(self):
        """Check if Lambda functions are deployed"""
        print("\n� CHECKING LAMBDA FUNCTIONS")
        print("-" * 30)
        
        try:
            # List Lambda functions
            functions = self.lambda_client.list_functions()['Functions']
            crowd_functions = [f for f in functions if 'crowd' in f['FunctionName'].lower()]
            
            if crowd_functions:
                print(f"✅ Found {len(crowd_functions)} crowd control functions:")
                for func in crowd_functions:
                    print(f"   📦 {func['FunctionName']} ({func['Runtime']})")
                    print(f"      Memory: {func['MemorySize']}MB")
                    print(f"      Last Modified: {func['LastModified']}")
                return True
            else:
                print("❌ No crowd control Lambda functions found")
                print("   Run: python backend/deploy_lambda_only.py")
                return False
                
        except Exception as e:
            print(f"❌ Lambda check failed: {e}")
            return False
    
    def check_bedrock_access(self):
        """Check Bedrock model access"""
        print("\n🤖 CHECKING BEDROCK ACCESS")
        print("-" * 30)
        
        try:
            # Check available foundation models
            models = self.bedrock.list_foundation_models()
            available_models = models.get('modelSummaries', [])
            
            # Check for specific models we use
            titan_models = [m for m in available_models if 'titan' in m['modelId'].lower()]
            gpt_models = [m for m in available_models if 'gpt' in m['modelId'].lower()]
            
            print(f"✅ Found {len(available_models)} available foundation models")
            print(f"   🤖 Amazon Titan models: {len(titan_models)}")
            print(f"   🤖 OpenAI GPT models: {len(gpt_models)}")
            
            if titan_models or gpt_models:
                return True
            else:
                print("⚠️  No usable models found")
                return False
                
        except Exception as e:
            print(f"❌ Bedrock check failed: {e}")
            print("   Note: Bedrock access may need to be granted")
            return False
    
    def check_iam_role(self):
        """Check IAM role"""
        print("\n🔑 CHECKING IAM ROLE")
        print("-" * 30)
        
        try:
            role = self.iam.get_role(RoleName='CrowdControlSageMakerRole')
            print(f"✅ Role exists: {role['Role']['RoleName']}")
            print(f"   Created: {role['Role']['CreateDate']}")
            
            # Check attached policies
            policies = self.iam.list_attached_role_policies(
                RoleName='CrowdControlSageMakerRole'
            )
            
            print("   Attached policies:")
            for policy in policies['AttachedPolicies']:
                print(f"   - {policy['PolicyName']}")
            
            return True
        except Exception as e:
            print(f"❌ IAM role check failed: {e}")
            return False
    
    def test_endpoint_prediction(self):
        """Test the endpoint with a real prediction"""
        print("\n🧪 TESTING ENDPOINT PREDICTION")
        print("-" * 30)
        
        # Sample crowd data
        test_data = {
            "gate_a_queue": 75,
            "gate_b_queue": 80,
            "gate_c_queue": 65,
            "gate_d_queue": 70,
            "section_a": 900,
            "section_b": 850,
            "section_c": 800,
            "section_d": 750,
            "food_court": 120,
            "toilet": 80,
            "staff_security": 25,
            "weather_condition": "Clear",
            "scenario_phase": "Peak",
            "parking_occupancy_percent": 85
        }
        
        try:
            print("📤 Sending prediction request...")
            print(f"💰 This call costs ~$0.001")
            
            response = self.runtime.invoke_endpoint(
                EndpointName=self.endpoint_name,
                ContentType='application/json',
                Accept='application/json',
                Body=json.dumps(test_data)
            )
            
            result = json.loads(response['Body'].read().decode())
            
            print("✅ PREDICTION SUCCESSFUL!")
            print(f"📋 Response from AWS SageMaker:")
            print(json.dumps(result, indent=2))
            
            return True
            
        except Exception as e:
            print(f"❌ Prediction test failed: {e}")
            return False
    
    def check_billing_status(self):
        """Show billing information"""
        print("\n💰 BILLING STATUS")
        print("-" * 30)
        
        try:
            # Get endpoint details for cost calculation
            response = self.sagemaker.describe_endpoint(
                EndpointName=self.endpoint_name
            )
            
            if response['EndpointStatus'] == 'InService':
                instance_type = response['ProductionVariants'][0]['InstanceType']
                creation_time = response['CreationTime']
                
                # Calculate running time
                now = datetime.now(creation_time.tzinfo)
                running_hours = (now - creation_time).total_seconds() / 3600
                
                # Estimate costs
                hourly_rates = {
                    'ml.t2.medium': 0.05,
                    'ml.m5.large': 0.10,
                    'ml.m5.xlarge': 0.20
                }
                
                hourly_cost = hourly_rates.get(instance_type, 0.05)
                current_cost = running_hours * hourly_cost
                
                print(f"💻 Instance: {instance_type}")
                print(f"⏰ Running: {running_hours:.1f} hours")
                print(f"💰 Hourly rate: ${hourly_cost}/hour")
                print(f"💰 Estimated cost so far: ${current_cost:.2f}")
                print(f"💰 Daily cost: ${hourly_cost * 24:.2f}")
                print(f"💰 Monthly cost: ${hourly_cost * 24 * 30:.2f}")
                
                print("\n⚠️  REMEMBER: Billing continues until you delete the endpoint!")
                print("🗑️  Delete in AWS Console > SageMaker > Endpoints")
                
            else:
                print("⚠️  Endpoint not running - no charges")
                
        except Exception as e:
            print(f"❌ Cannot calculate billing: {e}")
    
    def run_full_validation(self):
        """Run complete serverless validation"""
        print("🔍 AWS SERVERLESS DEPLOYMENT VALIDATION")
        print("=" * 50)
        
        checks = [
            ("AWS Credentials", self.check_aws_credentials),
            ("Lambda Functions", self.check_lambda_functions), 
            ("Bedrock Access", self.check_bedrock_access),
            ("IAM Permissions", self.check_iam_role)
        ]
        
        passed = 0
        total = len(checks)
        
        for check_name, check_func in checks:
            if check_func():
                passed += 1
        
        # Summary
        print(f"\n📊 VALIDATION SUMMARY")
        print("=" * 30)
        print(f"✅ Passed: {passed}/{total} checks")
        
        if passed == total:
            print("🎉 Serverless deployment is FULLY WORKING!")
            print("✅ Ready for hackathon demonstration")
            print("💰 Cost-effective serverless architecture")
        elif passed >= total * 0.7:
            print("⚠️  Deployment mostly working")
            print("   Some components may need attention")
        else:
            print("❌ Deployment has issues")
            print("   Check errors above")
        
        print(f"\n🔧 Fix deployment issues first:")
        print("1. Check AWS credentials")
        print("2. Re-run: python backend/deploy_lambda_only.py")
        print("3. Re-run: python backend/deploy_sagemaker_ai.py")
        
        return passed >= total * 0.7

def main():
    """Main validation"""
    validator = AWSDeploymentValidator()
    
    if validator.sagemaker is None:
        print("❌ Cannot validate - AWS not configured")
        return
    
    success = validator.run_full_validation()
    
    if success:
        print("\n🚀 Next steps:")
        print("1. Run: python run_demo.py")
        print("2. Test AWS predictions")
        print("3. Monitor costs in AWS Console")
    else:
        print("\n🔧 Fix deployment issues first:")
        print("1. Check AWS credentials")
        print("2. Re-run: python deploy_real_paid_sagemaker.py")

if __name__ == "__main__":
    main()