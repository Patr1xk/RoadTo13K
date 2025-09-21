#!/usr/bin/env python3
"""
🇲🇾 MALAYSIAN CROWD CONTROL AI - MAIN ENTRY POINT
================================================
Clean and organized project structure for hackathon demonstration
"""

import sys
import os
import subprocess
from pathlib import Path

def print_banner():
    """Display project banner"""
    print("🇲🇾 MALAYSIAN CROWD CONTROL AI SYSTEM")
    print("=" * 50)
    print("🏆 Hackathon-Ready Deployment")
    print("✅ Traditional ML (Lambda) + SageMaker AI (Bedrock)")
    print("✅ No S3 Required - Serverless Architecture")
    print("=" * 50)
    print()

def show_menu():
    """Show main menu options"""
    print("📋 AVAILABLE COMMANDS:")
    print("-" * 30)
    print("1. 🎬 Run Interactive Demo")
    print("2. 🚀 Deploy Lambda System")
    print("3. 🤖 Deploy SageMaker AI")
    print("4. ✅ Validate AWS Deployment") 
    print("5. 🧪 Test All AI Models")
    print("6. 🎪 Quick Demo (Local)")
    print("7. 📊 Project Documentation")
    print("8. ❌ Exit")
    print()

def run_backend_script(script_name):
    """Run a script from the backend directory"""
    backend_path = Path("backend")
    script_path = backend_path / script_name
    
    if not script_path.exists():
        print(f"❌ Script not found: {script_path}")
        return False
    
    try:
        # Change to backend directory and run script
        original_cwd = os.getcwd()
        os.chdir(backend_path)
        
        result = subprocess.run([sys.executable, script_name], 
                              capture_output=False, 
                              text=True)
        
        os.chdir(original_cwd)
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Error running {script_name}: {e}")
        os.chdir(original_cwd)
        return False

def show_documentation():
    """Show project documentation"""
    print("\n📖 PROJECT DOCUMENTATION")
    print("=" * 40)
    
    docs = [
        ("🎯 Deployment Summary", "DEPLOYMENT_SUMMARY.md"),
        ("🏗️ AWS Architecture", "AWS_ARCHITECTURE.md"), 
        ("🔑 AWS Keys Guide", "AWS_KEYS_GUIDE.md"),
        ("⚙️ AWS Setup Guide", "AWS_SETUP_GUIDE.md")
    ]
    
    for title, filename in docs:
        if Path(filename).exists():
            print(f"✅ {title}: {filename}")
        else:
            print(f"❌ {title}: {filename} (not found)")
    
    print("\n💡 Quick Start:")
    print("   python main.py  # This menu")
    print("   cd backend && python run_demo.py  # Direct demo")
    print()

def main():
    """Main entry point"""
    print_banner()
    
    # Check if backend directory exists
    if not Path("backend").exists():
        print("❌ Backend directory not found!")
        print("💡 Make sure you're in the project root directory")
        return
    
    # Check if config exists
    if not Path("config").exists():
        print("⚠️  Config directory not found - some features may not work")
    
    while True:
        show_menu()
        
        try:
            choice = input("👉 Enter your choice (1-8): ").strip()
            
            if choice == "1":
                print("\n🎬 LAUNCHING INTERACTIVE DEMO...")
                run_backend_script("run_demo.py")
                
            elif choice == "2":
                print("\n🚀 DEPLOYING LAMBDA SYSTEM...")
                run_backend_script("deploy_lambda_only.py")
                
            elif choice == "3":
                print("\n🤖 DEPLOYING SAGEMAKER AI...")
                run_backend_script("deploy_sagemaker_ai.py")
                
            elif choice == "4":
                print("\n✅ VALIDATING AWS DEPLOYMENT...")
                run_backend_script("validate_aws_deployment.py")
                
            elif choice == "5":
                print("\n🧪 TESTING ALL AI MODELS...")
                run_backend_script("test_all_granted_models.py")
                
            elif choice == "6":
                print("\n🎪 RUNNING QUICK DEMO...")
                print("💡 This will run a local demonstration")
                run_backend_script("run_demo.py")
                
            elif choice == "7":
                show_documentation()
                
            elif choice == "8":
                print("\n👋 Goodbye! Good luck with your hackathon!")
                break
                
            else:
                print("❌ Invalid choice. Please enter 1-8.")
            
            input("\nPress Enter to continue...")
            print("\n" + "="*50 + "\n")
            
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()