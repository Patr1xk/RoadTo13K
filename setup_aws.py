#!/usr/bin/env python3
"""
🛠️ EASY AWS SETUP
================
Simple setup for AWS credentials using .env file
"""

import os
import shutil
from pathlib import Path

def setup_aws_env():
    """Setup .env file with AWS credentials"""
    
    print("🛠️ AWS CREDENTIALS SETUP")
    print("=" * 30)
    
    # Check if .env exists
    if os.path.exists('.env'):
        print("✅ .env file already exists")
        overwrite = input("Overwrite existing .env? (y/n): ").lower().strip()
        if overwrite != 'y':
            print("❌ Setup cancelled")
            return False
    
    print("\n🔑 Get your AWS credentials from:")
    print("   AWS Console → IAM → Users → [Your User] → Security credentials")
    print("   → Create access key → Command Line Interface")
    
    # Get credentials from user
    access_key = input("\n📝 Enter AWS Access Key ID: ").strip()
    secret_key = input("📝 Enter AWS Secret Access Key: ").strip()
    
    if not access_key or not secret_key:
        print("❌ Both Access Key ID and Secret Key are required!")
        return False
    
    # Region selection
    print("\n🌍 Choose AWS Region:")
    print("1. ap-southeast-1 (Singapore) - Recommended for Malaysia")
    print("2. us-east-1 (N. Virginia)")
    print("3. eu-west-1 (Ireland)")
    
    region_choice = input("Enter choice (1-3) [1]: ").strip() or "1"
    
    regions = {
        "1": "ap-southeast-1",
        "2": "us-east-1", 
        "3": "eu-west-1"
    }
    
    region = regions.get(region_choice, "ap-southeast-1")
    
    # Create .env file
    env_content = f"""# AWS CREDENTIALS
# Get these from AWS Console → IAM → Users → Security credentials
AWS_ACCESS_KEY_ID={access_key}
AWS_SECRET_ACCESS_KEY={secret_key}
AWS_DEFAULT_REGION={region}

# SAGEMAKER CONFIGURATION
SAGEMAKER_ENDPOINT_NAME=crowd-control-predictor
S3_BUCKET_PREFIX=crowd-control

# DEPLOYMENT STATUS
DEPLOYMENT_STATUS=NOT_DEPLOYED
BILLING_STATUS=INACTIVE

# COST TRACKING
INSTANCE_TYPE=ml.t2.medium
ESTIMATED_HOURLY_COST=0.05
"""
    
    with open('.env', 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    print("\n✅ .env file created successfully!")
    print(f"✅ Region: {region}")
    print("✅ Credentials configured")
    
    # Test credentials
    print("\n🧪 Testing credentials...")
    try:
        import boto3
        from dotenv import load_dotenv
        load_dotenv()
        
        session = boto3.Session(
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=region
        )
        
        sts = session.client('sts')
        identity = sts.get_caller_identity()
        
        print("✅ Credentials valid!")
        print(f"✅ Account: {identity['Account']}")
        print(f"✅ User: {identity['Arn'].split('/')[-1]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Credential test failed: {e}")
        print("   Please check your Access Key ID and Secret Key")
        return False

def main():
    """Main setup function"""
    print("🛠️ EASY AWS SETUP FOR CROWD CONTROL SYSTEM")
    print("=" * 50)
    
    success = setup_aws_env()
    
    if success:
        print("\n🎉 SETUP COMPLETE!")
        print("=" * 30)
        print("✅ AWS credentials configured")
        print("✅ Ready to deploy to SageMaker")
        print("\n🚀 Next steps:")
        print("1. Deploy: python deploy_real_paid_sagemaker.py")
        print("2. Test: python run_demo.py")
    else:
        print("\n❌ Setup failed!")
        print("Please check your AWS credentials and try again")

if __name__ == "__main__":
    main()