#!/usr/bin/env python3
"""
AWS API Gateway Deployment - Simple Version
Malaysian Crowd Control AI Demo API
"""

import json
import boto3
import time
import os
from datetime import datetime
from dotenv import load_dotenv

def deploy_api_gateway():
    """Deploy API Gateway with all demo endpoints"""
    
    # Load environment
    load_dotenv('config/.env')
    
    print("AWS API GATEWAY DEPLOYMENT")
    print("=" * 50)
    
    try:
        # Initialize AWS clients
        api_gateway = boto3.client('apigateway', region_name='us-east-1')
        lambda_client = boto3.client('lambda', region_name='us-east-1')
        
        print("Creating REST API...")
        
        # Create REST API
        api_response = api_gateway.create_rest_api(
            name='malaysian-crowd-control-api',
            description='Malaysian Crowd Control AI Demo API',
            endpointConfiguration={'types': ['REGIONAL']}
        )
        
        api_id = api_response['id']
        print(f"API created: {api_id}")
        
        # Get root resource
        resources = api_gateway.get_resources(restApiId=api_id)
        root_id = resources['items'][0]['id']
        
        # Create /scenarios resource
        scenarios_resource = api_gateway.create_resource(
            restApiId=api_id,
            parentId=root_id,
            pathPart='scenarios'
        )
        scenarios_id = scenarios_resource['id']
        
        # Create /demo resource
        demo_resource = api_gateway.create_resource(
            restApiId=api_id,
            parentId=root_id,
            pathPart='demo'
        )
        demo_id = demo_resource['id']
        
        # Create /demo/{id} resource
        demo_param_resource = api_gateway.create_resource(
            restApiId=api_id,
            parentId=demo_id,
            pathPart='{id}'
        )
        demo_param_id = demo_param_resource['id']
        
        print("API resources created successfully")
        
        # Create Lambda function for API
        print("Creating Lambda function...")
        
        lambda_code = """
import json
from datetime import datetime

def lambda_handler(event, context):
    path = event.get('path', '/')
    method = event.get('httpMethod', 'GET')
    
    if path == '/scenarios' and method == 'GET':
        return get_scenarios()
    elif path.startswith('/demo/') and method == 'POST':
        scenario_id = int(path.split('/')[-1])
        return run_demo(scenario_id)
    
    return {
        'statusCode': 404,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Not found'})
    }

def get_scenarios():
    scenarios = [
        {
            "id": 1,
            "name": "KLCC New Year Countdown",
            "location": "KLCC Twin Towers",
            "risk_level": "high",
            "crowd_density": 0.9
        },
        {
            "id": 2,
            "name": "Stadium Exit Rush",
            "location": "Bukit Jalil Stadium",
            "risk_level": "medium",
            "crowd_density": 0.8
        },
        {
            "id": 3,
            "name": "Concert Entry Queue",
            "location": "Axiata Arena",
            "risk_level": "low",
            "crowd_density": 0.7
        }
    ]
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'data': scenarios})
    }

def run_demo(scenario_id):
    predictions = {
        1: {'risk_score': 0.92, 'wait_time': '15-20 min'},
        2: {'risk_score': 0.78, 'wait_time': '8-12 min'},
        3: {'risk_score': 0.68, 'wait_time': '3-5 min'}
    }
    
    result = {
        'scenario_id': scenario_id,
        'traditional_ml': {
            'prediction': predictions.get(scenario_id, predictions[1]),
            'processing_time': '0.2s',
            'cost': '$0.0001'
        },
        'sagemaker_ai': {
            'prediction': predictions.get(scenario_id, predictions[1]),
            'processing_time': '1.5s',
            'cost': '$0.01'
        },
        'timestamp': datetime.now().isoformat()
    }
    
    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'success': True, 'data': result})
    }
"""
        
        # Package Lambda function
        import zipfile
        import tempfile
        
        with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as tmp:
            with zipfile.ZipFile(tmp.name, 'w') as zip_file:
                zip_file.writestr('lambda_function.py', lambda_code)
            zip_path = tmp.name
        
        with open(zip_path, 'rb') as zip_file:
            zip_content = zip_file.read()
        
        # Delete existing function if exists
        try:
            lambda_client.delete_function(FunctionName='malaysian-crowd-api')
            time.sleep(2)
        except:
            pass
        
        # Create Lambda function
        lambda_response = lambda_client.create_function(
            FunctionName='malaysian-crowd-api',
            Runtime='python3.9',
            Role=f'arn:aws:iam::{boto3.client("sts").get_caller_identity()["Account"]}:role/crowd-control-lambda-role',
            Handler='lambda_function.lambda_handler',
            Code={'ZipFile': zip_content},
            Timeout=30
        )
        
        function_arn = lambda_response['FunctionArn']
        print(f"Lambda function created: {function_arn}")
        
        # Add API Gateway permission
        account_id = boto3.client('sts').get_caller_identity()['Account']
        
        try:
            lambda_client.add_permission(
                FunctionName='malaysian-crowd-api',
                StatementId='api-gateway-invoke',
                Action='lambda:InvokeFunction',
                Principal='apigateway.amazonaws.com',
                SourceArn=f'arn:aws:execute-api:us-east-1:{account_id}:{api_id}/*/*'
            )
        except:
            pass  # Permission might already exist
        
        # Create methods
        print("Creating API methods...")
        
        # GET /scenarios
        api_gateway.put_method(
            restApiId=api_id,
            resourceId=scenarios_id,
            httpMethod='GET',
            authorizationType='NONE'
        )
        
        api_gateway.put_integration(
            restApiId=api_id,
            resourceId=scenarios_id,
            httpMethod='GET',
            type='AWS_PROXY',
            integrationHttpMethod='POST',
            uri=f'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/{function_arn}/invocations'
        )
        
        # POST /demo/{id}
        api_gateway.put_method(
            restApiId=api_id,
            resourceId=demo_param_id,
            httpMethod='POST',
            authorizationType='NONE'
        )
        
        api_gateway.put_integration(
            restApiId=api_id,
            resourceId=demo_param_id,
            httpMethod='POST',
            type='AWS_PROXY',
            integrationHttpMethod='POST',
            uri=f'arn:aws:apigateway:us-east-1:lambda:path/2015-03-31/functions/{function_arn}/invocations'
        )
        
        # Deploy API
        print("Deploying API...")
        
        api_gateway.create_deployment(
            restApiId=api_id,
            stageName='prod'
        )
        
        api_url = f'https://{api_id}.execute-api.us-east-1.amazonaws.com/prod'
        
        print("=" * 60)
        print("API GATEWAY DEPLOYMENT SUCCESSFUL!")
        print("=" * 60)
        print(f"API URL: {api_url}")
        print("Endpoints:")
        print(f"  GET  {api_url}/scenarios")
        print(f"  POST {api_url}/demo/1")
        print(f"  POST {api_url}/demo/2")
        print(f"  POST {api_url}/demo/3")
        print("=" * 60)
        
        # Save API info
        api_info = {
            'api_id': api_id,
            'api_url': api_url,
            'endpoints': [
                f'{api_url}/scenarios',
                f'{api_url}/demo/1',
                f'{api_url}/demo/2',
                f'{api_url}/demo/3'
            ]
        }
        
        with open('api_gateway_info.json', 'w') as f:
            json.dump(api_info, f, indent=2)
        
        # Clean up
        os.unlink(zip_path)
        
        return api_info
        
    except Exception as e:
        print(f"Deployment failed: {e}")
        return None

if __name__ == "__main__":
    deploy_api_gateway()