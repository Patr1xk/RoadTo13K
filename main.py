#!/usr/bin/env python3
"""
 MALAYSIAN CROWD CONTROL AI - MAIN ORCHESTRATOR
=================================================
One command to deploy everything and run complete demo
"""

import sys
import os
import subprocess
import json
import webbrowser
from pathlib import Path

def print_banner():
    """Display project banner"""
    print(" MALAYSIAN CROWD CONTROL AI SYSTEM")
    print("=" * 60)
    print(" Hackathon-Ready Complete Deployment")
    print(" Traditional ML (Lambda) + SageMaker AI (Bedrock)")
    print(" Live API Gateway Endpoints")
    print(" No S3 Required - Pure Serverless")
    print("=" * 60)
    print()

def show_menu():
    """Show main menu options"""
    print(" AVAILABLE COMMANDS:")
    print("-" * 40)
    print("1.  AUTO DEPLOY EVERYTHING (Recommended)")
    print("2.  Deploy API Gateway Only") 
    print("3.  Run Local Demo")
    print("4.  Validate AWS Deployment")
    print("5.  Show API Documentation")
    print("6.  Exit")
    print("-" * 40)

def run_backend_script(script_name):
    """Run a script from the backend directory"""
    try:
        script_path = Path("backend") / script_name
        
        if not script_path.exists():
            print(f" Script not found: {script_path}")
            return False
            
        print(f" Running {script_name}...")
        result = subprocess.run([sys.executable, str(script_path)], 
                              capture_output=False, text=True)
        
        if result.returncode == 0:
            print(f" {script_name} completed successfully!")
            return True
        else:
            print(f" {script_name} failed with exit code {result.returncode}")
            return False
            
    except Exception as e:
        print(f" Error running {script_name}: {e}")
        return False

def auto_deploy_everything():
    """Auto deploy complete system - Lambda + SageMaker + API Gateway"""
    print("\n STARTING COMPLETE AUTO DEPLOYMENT")
    print("=" * 60)
    print("This will deploy:")
    print("1.  Traditional ML System (AWS Lambda)")
    print("2.  SageMaker AI System (AWS Bedrock)")
    print("3.  API Gateway with 2 endpoints")
    print("4.  Complete demo ready for frontend")
    print("=" * 60)
    
    confirm = input("\n Continue with auto deployment? (y/n): ").strip().lower()
    if confirm != 'y':
        print(" Deployment cancelled.")
        return
    
    try:
        # Step 1: Run auto demo (deploys Lambda + SageMaker)
        print("\n STEP 1: Deploying ML Systems...")
        success1 = run_backend_script("auto_demo.py")
        
        if not success1:
            print(" ML systems deployment had issues, but continuing...")
        
        # Step 2: Deploy API Gateway
        print("\n STEP 2: Deploying API Gateway...")
        success2 = run_backend_script("enhanced_api_deploy.py")
        
        if success2:
            print("\n COMPLETE DEPLOYMENT SUCCESSFUL!")
            print("=" * 60)
            
            # Show API info
            try:
                with open("api_gateway_info.json", 'r') as f:
                    api_info = json.load(f)
                
                print(" YOUR LIVE API ENDPOINTS:")
                print(f" Base URL: {api_info['api_url']}")
                print(" Endpoints:")
                for endpoint in api_info['endpoints']:
                    print(f"    {endpoint}")
                
                print("\n FRONTEND INTEGRATION:")
                print("    Open 'api_docs.html' for interactive testing")
                print("    Use endpoints above in your frontend")
                print("=" * 60)
                
            except:
                print(" API info file not found, but deployment may have succeeded")
        
        else:
            print(" API Gateway deployment failed")
            
    except Exception as e:
        print(f" Auto deployment error: {e}")

def deploy_api_only():
    """Deploy only the API Gateway"""
    print("\n DEPLOYING API GATEWAY ONLY...")
    success = run_backend_script("enhanced_api_deploy.py")
    
    if success:
        show_api_info()

def show_api_info():
    """Show current API information"""
    try:
        with open("api_gateway_info.json", 'r') as f:
            api_info = json.load(f)
        
        print("\n CURRENT API ENDPOINTS:")
        print("=" * 50)
        print(f" Base URL: {api_info['api_url']}")
        print(" Available Endpoints:")
        
        for i, endpoint in enumerate(api_info['endpoints'], 1):
            method = "POST" if "run-demo" in endpoint else "GET"
            name = "Complete Demo" if "run-demo" in endpoint else "Evaluation Metrics"
            print(f"   {i}. {method} {endpoint}")
            print(f"       {name}")
        
        print("=" * 50)
        
    except FileNotFoundError:
        print(" No API deployment found. Run option 1 or 2 first.")
    except Exception as e:
        print(f" Error reading API info: {e}")

def show_documentation():
    """Show API documentation"""
    doc_file = "api_docs.html"
    
    if os.path.exists(doc_file):
        print(f"\n Opening API documentation: {doc_file}")
        try:
            webbrowser.open(f"file://{os.path.abspath(doc_file)}")
            print(" Documentation opened in browser")
        except:
            print(f" Please manually open: {doc_file}")
    else:
        print(" Documentation file not found. Run deployment first.")

def main():
    """Main application loop"""
    print_banner()
    
    while True:
        try:
            show_menu()
            choice = input("\n Enter your choice (1-6): ").strip()
            
            if choice == "1":
                auto_deploy_everything()
                
            elif choice == "2":
                deploy_api_only()
                
            elif choice == "3":
                print("\n RUNNING LOCAL DEMO...")
                run_backend_script("run_demo.py")
                
            elif choice == "4":
                print("\n VALIDATING AWS DEPLOYMENT...")
                run_backend_script("validate_aws_deployment.py")
                
            elif choice == "5":
                show_documentation()
                
            elif choice == "6":
                print("\n Goodbye! Good luck with your hackathon!")
                break
                
            else:
                print(" Invalid choice. Please enter 1-6.")
            
            input("\nPress Enter to continue...")
            print("\n" + "="*60 + "\n")
            
        except KeyboardInterrupt:
            print("\n\n Goodbye!")
            break
        except Exception as e:
            print(f" Error: {e}")

if __name__ == "__main__":
    main()
