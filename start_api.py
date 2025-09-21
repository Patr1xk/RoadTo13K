#!/usr/bin/env python3
"""
🇲🇾 START FRONTEND API SERVER
=============================
Simple command to start the API for frontend integration
"""

import subprocess
import sys
import os

def install_requirements():
    """Install required packages"""
    print("📦 Installing requirements...")
    subprocess.run([sys.executable, "-m", "pip", "install", "flask", "flask-cors"], check=True)

def start_api_server():
    """Start the API server"""
    print("🚀 Starting API server...")
    subprocess.run([sys.executable, "frontend_api.py"])

if __name__ == "__main__":
    print("🇲🇾 MALAYSIAN CROWD CONTROL AI")
    print("🌐 Frontend Integration Setup")
    print("=" * 40)
    
    try:
        install_requirements()
        start_api_server()
    except KeyboardInterrupt:
        print("\n👋 Server stopped!")
    except Exception as e:
        print(f"❌ Error: {e}")