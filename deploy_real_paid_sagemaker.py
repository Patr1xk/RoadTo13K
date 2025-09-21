#!/usr/bin/env python3
"""
🚀 REAL AWS SAGEMAKER DEPLOYMENT
===============================
Production deployment to actual AWS SageMaker endpoints (COSTS MONEY!)

Usage:
    python deploy_real_paid_sagemaker.py

Cost Warning:
    - ml.t2.medium: $0.05/hour (~$36/month)
    - ml.m5.large: $0.10/hour (~$72/month)
    - Plus inference costs: ~$0.001 per prediction
"""

import os
import sys
import json
import boto3
import pickle
import tarfile
import tempfile
import shutil
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

class SageMakerDeployer:
    def __init__(self, region=None):
        # Get configuration from environment
        self.region = region or os.getenv('AWS_DEFAULT_REGION', 'ap-southeast-1')
        self.endpoint_name = os.getenv('SAGEMAKER_ENDPOINT_NAME', 'crowd-control-predictor')
        
        self.bucket_name = f"crowd-control-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        self.role_name = "CrowdControlSageMakerRole"
        
        # Set up AWS credentials from .env if available
        aws_access_key = os.getenv('AWS_ACCESS_KEY_ID')
        aws_secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')
        
        if aws_access_key and aws_secret_key:
            session = boto3.Session(
                aws_access_key_id=aws_access_key,
                aws_secret_access_key=aws_secret_key,
                region_name=self.region
            )
            self.sagemaker = session.client('sagemaker')
            self.s3 = session.client('s3')
            self.iam = session.client('iam')
            print("✅ Using AWS credentials from .env file")
        else:
            # Fallback to default AWS configuration
            self.sagemaker = boto3.client('sagemaker', region_name=self.region)
            self.s3 = boto3.client('s3', region_name=self.region)
            self.iam = boto3.client('iam', region_name=self.region)
            print("✅ Using AWS credentials from aws configure")
    
    def check_credentials(self):
        """Verify AWS setup"""
        try:
            sts = boto3.client('sts')
            identity = sts.get_caller_identity()
            print(f"✅ AWS Account: {identity['Account']}")
            return True
        except Exception as e:
            print(f"❌ AWS Error: {e}")
            return False
    
    def deploy(self, instance_type='ml.t2.medium'):
        """Deploy complete stack"""
        print("🚀 DEPLOYING TO AWS SAGEMAKER")
        print("💰 THIS WILL COST MONEY!")
        print(f"💰 Estimated: ${0.05 if 't2' in instance_type else 0.10}/hour")
        
        confirm = input("\nContinue with deployment? (yes/no): ")
        if confirm.lower() != 'yes':
            return False
        
        steps = [
            ("Checking credentials", self.check_credentials),
            ("Creating S3 bucket", self._create_bucket),
            ("Creating IAM role", self._create_role),
            ("Uploading models", self._upload_models),
            ("Creating endpoint", lambda: self._create_endpoint(instance_type))
        ]
        
        for step_name, step_func in steps:
            print(f"\n⏳ {step_name}...")
            if not step_func():
                print(f"❌ {step_name} failed!")
                return False
            print(f"✅ {step_name} completed")
        
        print("\n🎉 DEPLOYMENT SUCCESSFUL!")
        print(f"✅ Endpoint: {self.endpoint_name}")
        print("💰 BILLING IS NOW ACTIVE!")
        return True
    
    def _create_bucket(self):
        """Create S3 bucket"""
        try:
            if self.region != 'us-east-1':
                self.s3.create_bucket(
                    Bucket=self.bucket_name,
                    CreateBucketConfiguration={'LocationConstraint': self.region}
                )
            else:
                self.s3.create_bucket(Bucket=self.bucket_name)
            return True
        except Exception as e:
            print(f"S3 Error: {e}")
            return False
    
    def _create_role(self):
        """Create IAM role"""
        trust_policy = {
            "Version": "2012-10-17",
            "Statement": [{
                "Effect": "Allow",
                "Principal": {"Service": "sagemaker.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }]
        }
        
        try:
            self.iam.create_role(
                RoleName=self.role_name,
                AssumeRolePolicyDocument=json.dumps(trust_policy)
            )
            
            # Attach policies
            policies = [
                'arn:aws:iam::aws:policy/AmazonSageMakerFullAccess',
                'arn:aws:iam::aws:policy/AmazonS3FullAccess'
            ]
            
            for policy in policies:
                self.iam.attach_role_policy(
                    RoleName=self.role_name,
                    PolicyArn=policy
                )
            return True
        except Exception as e:
            if 'EntityAlreadyExists' in str(e):
                return True
            print(f"IAM Error: {e}")
            return False
    
    def _upload_models(self):
        """Upload trained models"""
        try:
            # Train models first
            from sagemaker_ml import SageMakerML
            ml = SageMakerML()
            ml.train_and_save_models()
            
            # Create model package
            with tempfile.TemporaryDirectory() as temp_dir:
                # Copy models
                model_dir = Path('models')
                for model_file in model_dir.glob('*.pkl'):
                    shutil.copy(model_file, temp_dir)
                
                # Create inference script
                self._create_inference_script(temp_dir)
                
                # Package and upload
                package_path = f"{temp_dir}/model.tar.gz"
                with tarfile.open(package_path, 'w:gz') as tar:
                    tar.add(temp_dir, arcname='.')
                
                self.s3.upload_file(package_path, self.bucket_name, 'model.tar.gz')
            
            return True
        except Exception as e:
            print(f"Upload Error: {e}")
            return False
    
    def _create_inference_script(self, temp_dir):
        """Create inference.py for SageMaker"""
        script = '''
import json
import pickle
import pandas as pd
import numpy as np
from pathlib import Path

def model_fn(model_dir):
    models = {}
    for pkl_file in Path(model_dir).glob("*.pkl"):
        with open(pkl_file, 'rb') as f:
            models[pkl_file.stem] = pickle.load(f)
    return models

def input_fn(request_body, content_type):
    if content_type == 'application/json':
        return pd.DataFrame([json.loads(request_body)])
    raise ValueError(f"Unsupported content type: {content_type}")

def predict_fn(input_data, models):
    try:
        # Basic feature engineering
        features = input_data.copy()
        
        if all(col in features.columns for col in ['gate_a_queue', 'gate_b_queue', 'gate_c_queue', 'gate_d_queue']):
            features['total_queue'] = features[['gate_a_queue', 'gate_b_queue', 'gate_c_queue', 'gate_d_queue']].sum(axis=1)
        
        numeric_features = features.select_dtypes(include=[np.number]).fillna(0)
        
        predictions = {}
        
        if 'general_risk_model' in models and 'risk_encoder' in models:
            risk_pred = models['general_risk_model'].predict(numeric_features)[0]
            predictions['risk_level'] = models['risk_encoder'].inverse_transform([risk_pred])[0]
        
        if 'general_action_model' in models and 'action_encoder' in models:
            action_pred = models['general_action_model'].predict(numeric_features)[0]
            predictions['recommended_action'] = models['action_encoder'].inverse_transform([action_pred])[0]
        
        return predictions
    except Exception as e:
        return {'error': str(e), 'risk_level': 'High'}

def output_fn(prediction, accept):
    if accept == 'application/json':
        return json.dumps({
            'predictions': prediction,
            'source': 'AWS SageMaker Real Endpoint'
        }), accept
    raise ValueError(f"Unsupported accept type: {accept}")
'''
        
        with open(f"{temp_dir}/inference.py", 'w') as f:
            f.write(script)
    
    def _create_endpoint(self, instance_type):
        """Create SageMaker endpoint"""
        try:
            # Get role ARN
            role = self.iam.get_role(RoleName=self.role_name)
            role_arn = role['Role']['Arn']
            
            model_url = f"s3://{self.bucket_name}/model.tar.gz"
            
            # Create model
            self.sagemaker.create_model(
                ModelName=self.endpoint_name,
                PrimaryContainer={
                    'Image': '763104351884.dkr.ecr.ap-southeast-1.amazonaws.com/sklearn-inference:0.23-1-cpu-py3',
                    'ModelDataUrl': model_url,
                    'Environment': {'SAGEMAKER_PROGRAM': 'inference.py'}
                },
                ExecutionRoleArn=role_arn
            )
            
            # Create endpoint config
            config_name = f"{self.endpoint_name}-config"
            self.sagemaker.create_endpoint_config(
                EndpointConfigName=config_name,
                ProductionVariants=[{
                    'VariantName': 'primary',
                    'ModelName': self.endpoint_name,
                    'InitialInstanceCount': 1,
                    'InstanceType': instance_type
                }]
            )
            
            # Create endpoint
            self.sagemaker.create_endpoint(
                EndpointName=self.endpoint_name,
                EndpointConfigName=config_name
            )
            
            # Wait for endpoint
            print("⏳ Waiting for endpoint (5-10 minutes)...")
            waiter = self.sagemaker.get_waiter('endpoint_in_service')
            waiter.wait(EndpointName=self.endpoint_name)
            
            return True
        except Exception as e:
            if 'already exists' in str(e):
                return True
            print(f"Endpoint Error: {e}")
            return False

def main():
    """Deploy to AWS SageMaker"""
    deployer = SageMakerDeployer()
    
    print("💰 REAL AWS SAGEMAKER DEPLOYMENT")
    print("⚠️  This will create billable resources!")
    
    # Choose instance
    print("\n💻 Instance types:")
    print("1. ml.t2.medium ($0.05/hour)")
    print("2. ml.m5.large ($0.10/hour)")
    
    choice = input("Choose (1-2) [1]: ").strip() or "1"
    instance_type = "ml.t2.medium" if choice == "1" else "ml.m5.large"
    
    # Deploy
    success = deployer.deploy(instance_type)
    
    if success:
        print("\n🎉 DEPLOYMENT SUCCESSFUL!")
        print("💰 Your endpoint is now running and billing!")
        
        # Create .env
        with open('.env', 'w') as f:
            f.write(f"SAGEMAKER_ENDPOINT_NAME={deployer.endpoint_name}\n")
            f.write(f"AWS_REGION={deployer.region}\n")
            f.write(f"DEPLOYMENT_STATUS=PRODUCTION\n")
        
        print("✅ Created .env file")
        print("\n🧪 Test with: python run_demo.py --test")
        print("🗑️  Delete with AWS Console to stop billing")
    else:
        print("\n❌ Deployment failed!")

if __name__ == "__main__":
    main()