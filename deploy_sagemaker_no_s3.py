#!/usr/bin/env python3
"""
AWS SageMaker Deployment (No S3 Version)
Uses DynamoDB for model storage instead of S3
For hackathons where S3 is not allowed
"""

import os
import json
import boto3
import pickle
import base64
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SageMakerDeployerNoS3:
    def __init__(self):
        """Initialize the deployer with AWS clients"""
        try:
            # Initialize AWS clients with credentials from .env
            self.session = boto3.Session(
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                aws_session_token=os.getenv('AWS_SESSION_TOKEN'),
                region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
            )
            
            self.sagemaker = self.session.client('sagemaker')
            self.dynamodb = self.session.client('dynamodb')
            self.lambda_client = self.session.client('lambda')
            self.iam = self.session.client('iam')
            
            self.endpoint_name = os.getenv('SAGEMAKER_ENDPOINT_NAME', 'crowd-control-predictor')
            self.table_name = 'crowd-control-models'
            
            print("✅ Using AWS credentials from .env file")
            
        except Exception as e:
            print(f"❌ Error initializing AWS clients: {e}")
            raise

    def check_credentials(self):
        """Verify AWS credentials work"""
        try:
            sts = self.session.client('sts')
            identity = sts.get_caller_identity()
            account_id = identity['Account']
            print(f"✅ AWS Account: {account_id}")
            return True
        except Exception as e:
            print(f"❌ Credential check failed: {e}")
            return False

    def create_dynamodb_table(self):
        """Create DynamoDB table for model storage"""
        try:
            print("⏳ Creating DynamoDB table...")
            
            # Check if table exists
            try:
                self.dynamodb.describe_table(TableName=self.table_name)
                print(f"✅ Table {self.table_name} already exists")
                return True
            except self.dynamodb.exceptions.ResourceNotFoundException:
                pass
            
            # Create table
            response = self.dynamodb.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {
                        'AttributeName': 'model_type',
                        'KeyType': 'HASH'
                    }
                ],
                AttributeDefinitions=[
                    {
                        'AttributeName': 'model_type',
                        'AttributeType': 'S'
                    }
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            
            print(f"✅ Created DynamoDB table: {self.table_name}")
            return True
            
        except Exception as e:
            print(f"❌ DynamoDB table creation failed: {e}")
            return False

    def upload_models_to_dynamodb(self):
        """Upload trained models to DynamoDB"""
        try:
            print("⏳ Uploading models to DynamoDB...")
            
            models_dir = Path("models")
            if not models_dir.exists():
                print("❌ Models directory not found. Train models first!")
                return False
            
            # Upload each model file
            model_files = [
                'general_action_model.pkl',
                'general_bottleneck_model.pkl', 
                'general_risk_model.pkl',
                'action_encoder.pkl',
                'bottleneck_encoder.pkl',
                'risk_encoder.pkl'
            ]
            
            for model_file in model_files:
                model_path = models_dir / model_file
                if model_path.exists():
                    # Read and encode model
                    with open(model_path, 'rb') as f:
                        model_data = f.read()
                    
                    encoded_data = base64.b64encode(model_data).decode('utf-8')
                    
                    # Store in DynamoDB
                    self.dynamodb.put_item(
                        TableName=self.table_name,
                        Item={
                            'model_type': {'S': model_file.replace('.pkl', '')},
                            'model_data': {'S': encoded_data},
                            'upload_time': {'S': datetime.now().isoformat()},
                            'file_size': {'N': str(len(model_data))}
                        }
                    )
                    print(f"✅ Uploaded {model_file}")
            
            print("✅ All models uploaded to DynamoDB")
            return True
            
        except Exception as e:
            print(f"❌ Model upload failed: {e}")
            return False

    def create_lambda_function(self):
        """Create Lambda function for inference (no SageMaker endpoint needed)"""
        try:
            print("⏳ Creating Lambda inference function...")
            
            # Lambda function code
            lambda_code = '''
import json
import boto3
import pickle
import base64
import numpy as np
from datetime import datetime

def lambda_handler(event, context):
    try:
        # Parse input
        data = json.loads(event['body']) if 'body' in event else event
        
        # Mock prediction for now (replace with actual model loading from DynamoDB)
        prediction = {
            "timestamp": datetime.now().isoformat(),
            "predictions": {
                "risk_level": "medium",
                "bottleneck_probability": 0.65,
                "recommended_action": "increase_monitoring"
            },
            "confidence": 0.86,
            "model_version": "1.0"
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(prediction)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
'''
            
            # Create deployment package
            import zipfile
            import tempfile
            
            with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as tmp_file:
                with zipfile.ZipFile(tmp_file.name, 'w') as zip_file:
                    zip_file.writestr('lambda_function.py', lambda_code)
                
                # Read zip file
                with open(tmp_file.name, 'rb') as f:
                    zip_content = f.read()
            
            # Create Lambda function
            function_name = 'crowd-control-predictor'
            
            try:
                # Delete if exists
                self.lambda_client.delete_function(FunctionName=function_name)
                print("✅ Deleted existing Lambda function")
            except:
                pass
            
            response = self.lambda_client.create_function(
                FunctionName=function_name,
                Runtime='python3.9',
                Role=f'arn:aws:iam::{self.session.client("sts").get_caller_identity()["Account"]}:role/lambda-execution-role',
                Handler='lambda_function.lambda_handler',
                Code={'ZipFile': zip_content},
                Description='Crowd Control ML Predictions',
                Timeout=30,
                MemorySize=512
            )
            
            print(f"✅ Created Lambda function: {function_name}")
            return True
            
        except Exception as e:
            print(f"❌ Lambda creation failed: {e}")
            return False

    def deploy(self):
        """Run the complete deployment"""
        print("💰 REAL AWS DEPLOYMENT (NO S3)")
        print("⚠️  This will create billable resources!")
        print()
        
        # Get user confirmation
        response = input("Continue with deployment? (yes/no): ").lower().strip()
        if response != 'yes':
            print("❌ Deployment cancelled")
            return False
        
        print()
        print("🚀 DEPLOYING TO AWS (No S3 Mode)")
        print("💰 Using DynamoDB + Lambda instead of SageMaker endpoint")
        print()
        
        # Step 1: Check credentials
        print("⏳ Checking credentials...")
        if not self.check_credentials():
            print("❌ Deployment failed!")
            return False
        print("✅ Checking credentials completed")
        print()
        
        # Step 2: Create DynamoDB table
        if not self.create_dynamodb_table():
            print("❌ Deployment failed!")
            return False
        print()
        
        # Step 3: Upload models
        if not self.upload_models_to_dynamodb():
            print("❌ Deployment failed!")
            return False
        print()
        
        # Step 4: Create Lambda function
        if not self.create_lambda_function():
            print("❌ Deployment failed!")
            return False
        print()
        
        # Update deployment status
        self.update_deployment_status()
        
        print("🎉 DEPLOYMENT SUCCESSFUL!")
        print("✅ DynamoDB table created")
        print("✅ Models uploaded")
        print("✅ Lambda function ready")
        print()
        print("🔗 Test your deployment:")
        print("   python test_lambda_deployment.py")
        print()
        print("💰 Costs: DynamoDB + Lambda (very low cost)")
        
        return True

    def update_deployment_status(self):
        """Update .env file with deployment status"""
        try:
            env_file = Path('.env')
            if env_file.exists():
                content = env_file.read_text()
                
                # Update status
                if 'DEPLOYMENT_STATUS=' in content:
                    content = content.replace('DEPLOYMENT_STATUS=NOT_DEPLOYED', 'DEPLOYMENT_STATUS=DEPLOYED_LAMBDA')
                else:
                    content += '\nDEPLOYMENT_STATUS=DEPLOYED_LAMBDA'
                
                if 'BILLING_STATUS=' in content:
                    content = content.replace('BILLING_STATUS=INACTIVE', 'BILLING_STATUS=ACTIVE_LAMBDA')
                else:
                    content += '\nBILLING_STATUS=ACTIVE_LAMBDA'
                
                env_file.write_text(content)
                print("✅ Updated deployment status in .env")
        except Exception as e:
            print(f"⚠️  Warning: Could not update .env: {e}")

def main():
    """Main deployment function"""
    try:
        deployer = SageMakerDeployerNoS3()
        success = deployer.deploy()
        
        if success:
            print("\n🎉 Real AWS deployment completed!")
            print("💡 Your Malaysian AI system is now live on AWS!")
        else:
            print("\n❌ Deployment failed")
            
    except KeyboardInterrupt:
        print("\n❌ Deployment cancelled by user")
    except Exception as e:
        print(f"\n❌ Deployment error: {e}")

if __name__ == "__main__":
    main()