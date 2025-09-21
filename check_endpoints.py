#!/usr/bin/env python3
import os
import boto3
from dotenv import load_dotenv

# Load environment variables
load_dotenv('./config/.env')

try:
    # Create SageMaker client with explicit credentials
    client = boto3.client(
        'sagemaker',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        aws_session_token=os.getenv('AWS_SESSION_TOKEN'),
        region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
    )
    
    # List endpoints
    endpoints = client.list_endpoints()
    
    print("🔍 EXISTING SAGEMAKER ENDPOINTS:")
    print("=" * 50)
    
    if endpoints['Endpoints']:
        for ep in endpoints['Endpoints']:
            print(f"📍 Name: {ep['EndpointName']}")
            print(f"   Status: {ep['EndpointStatus']}")
            print(f"   Created: {ep['CreationTime']}")
            print("-" * 30)
    else:
        print("❌ No SageMaker endpoints found in your account")
        print("\n💡 To create the endpoint, you need to:")
        print("   1. Train your models (already done ✅)")
        print("   2. Deploy to SageMaker endpoint")
        
    print(f"\n🎯 Your code is looking for: 'crowd-management-endpoint'")
    
except Exception as e:
    print(f"❌ Error checking endpoints: {e}")
    print("🔧 Make sure your AWS credentials are valid")
