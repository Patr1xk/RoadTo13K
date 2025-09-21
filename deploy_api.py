#!/usr/bin/env python3
"""
🇲🇾 DEPLOY AWS API GATEWAY
=========================
Simple script to deploy your API to AWS
"""

import os
import sys
import subprocess

def deploy_api_gateway():
    """Deploy API Gateway"""
    print("🇲🇾 MALAYSIAN CROWD CONTROL AI")
    print("🚀 AWS API Gateway Deployment")
    print("=" * 50)
    
    try:
        # Change to backend directory
        os.chdir('backend')
        
        # Run deployment
        result = subprocess.run([sys.executable, 'deploy_api_gateway.py'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print(result.stdout)
            print("🎉 API Gateway deployed successfully!")
        else:
            print("❌ Deployment failed:")
            print(result.stderr)
            
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        os.chdir('..')

if __name__ == "__main__":
    deploy_api_gateway()