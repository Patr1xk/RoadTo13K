# 🇲🇾 Malaysian Crowd Control AI System

**Complete crowd management solution with AWS integration for hackathons**

## 🏆 Project Overview

Advanced AI system for Malaysian crowd control using both **Traditional ML** and **SageMaker AI** approaches:

- ✅ **Traditional ML**: Custom models in AWS Lambda (86% accuracy)
- ✅ **SageMaker AI**: Foundation models via AWS Bedrock (4 models)
- ✅ **Serverless**: No S3 required, cost-effective for hackathons
- ✅ **Malaysian-focused**: Cultural factors and local insights

## 🚀 Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure AWS credentials (see AWS_KEYS_GUIDE.md)
cp .env.example config/.env
# Edit config/.env with your AWS credentials

# 3. Run the system
python main.py
```

## 📁 Project Structure

```
RoadTo13K/
├── main.py                     # 🎯 Main entry point
├── backend/                    # 🔧 Core system files
│   ├── run_demo.py            # 🎬 Interactive demo
│   ├── deploy_lambda_only.py   # 🚀 Lambda deployment
│   ├── deploy_sagemaker_ai.py  # 🤖 SageMaker AI deployment
│   ├── validate_aws_deployment.py # ✅ Validation script
│   ├── test_all_granted_models.py # 🧪 Model testing
│   ├── sagemaker_ml.py        # 🧠 Traditional ML system
│   ├── api.py                 # 🌐 REST API endpoints
│   ├── models.py              # 📊 Data models
│   └── live_data_generator.py # 📈 Live data simulation
├── config/                     # ⚙️ Configuration
│   ├── .env                   # 🔑 AWS credentials (create from .env.example)
│   └── settings.py            # 📋 System settings
├── dataset/                    # 📊 Training data
│   └── enhanced_crowd_flow_enhance.csv
├── models/                     # 🧠 Trained ML models
├── frontend/                   # 🎨 UI components
└── docs/                      # 📖 Documentation
    ├── DEPLOYMENT_SUMMARY.md
    ├── AWS_ARCHITECTURE.md
    ├── AWS_KEYS_GUIDE.md
    └── AWS_SETUP_GUIDE.md
```

## 🎯 Available Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `python main.py` | Main menu system | 🎬 Hackathon demo |
| `cd backend && python run_demo.py` | Interactive demo | 🎪 Full experience |
| `cd backend && python deploy_lambda_only.py` | Deploy Traditional ML | 🚀 Fast deployment |
| `cd backend && python deploy_sagemaker_ai.py` | Deploy SageMaker AI | 🤖 Advanced AI |
| `cd backend && python validate_aws_deployment.py` | Validate deployment | ✅ Check status |
| `cd backend && python test_all_granted_models.py` | Test AI models | 🧪 Model validation |

## 🏅 Key Features

### 🧠 Dual AI Architecture
- **Traditional ML**: Fast, reliable, cost-effective
- **SageMaker AI**: Advanced reasoning, natural language insights

### 🇲🇾 Malaysian Expertise
- Cultural crowd behavior patterns
- Local event scenarios (concerts, festivals, stadium exits)
- Bilingual communication strategies
- Regional emergency protocols

### 💰 Hackathon-Optimized
- No S3 storage costs
- Serverless architecture
- Pay-per-use pricing
- Quick deployment

## 🚀 Deployment Options

### Option 1: Traditional ML (Lambda)
```bash
cd backend
python deploy_lambda_only.py
```
- ✅ 86% accuracy on Malaysian scenarios
- ✅ <$1/month operating cost
- ✅ 2-minute deployment

### Option 2: SageMaker AI (Bedrock)
```bash
cd backend  
python deploy_sagemaker_ai.py
```
- ✅ 4 foundation models (Amazon Titan, OpenAI GPT)
- ✅ Advanced natural language insights
- ✅ Serverless foundation models

## 📊 Model Performance

| System | Accuracy | Cost | Deployment | AI Type |
|--------|----------|------|------------|---------|
| **Traditional ML** | 86% | <$1/month | 2 min | Custom ML |
| **SageMaker AI** | Advanced | $0.01/query | 1 min | Foundation Models |

## 🔧 Prerequisites

1. **Python 3.11+**
2. **AWS Account** with permanent credentials
3. **Permissions**: Lambda, Bedrock, IAM (no S3 needed)
4. **Models**: Amazon Titan access (free), OpenAI GPT access

## 📖 Documentation

- 📋 **[Deployment Summary](DEPLOYMENT_SUMMARY.md)** - Complete system overview
- 🏗️ **[AWS Architecture](AWS_ARCHITECTURE.md)** - Technical architecture
- 🔑 **[AWS Keys Guide](AWS_KEYS_GUIDE.md)** - Credential setup
- ⚙️ **[AWS Setup Guide](AWS_SETUP_GUIDE.md)** - Step-by-step setup

## 💡 Tips for Hackathons

1. **Demo Flow**: Start with `python main.py` for best experience
2. **Cost Control**: Both systems are designed for minimal AWS costs
3. **Scalability**: Systems can handle production workloads
4. **Flexibility**: Switch between Traditional ML and SageMaker AI
5. **Documentation**: All guides included for judges/reviewers

## 🏆 Awards & Recognition

Built for Malaysian hackathons with focus on:
- 🇲🇾 Local crowd behavior expertise
- 💰 Cost-effective AWS architecture  
- 🚀 Rapid deployment capability
- 🧠 Cutting-edge AI integration
- 📊 Proven accuracy metrics

---

**Ready to revolutionize crowd control in Malaysia! 🇲🇾🏆**