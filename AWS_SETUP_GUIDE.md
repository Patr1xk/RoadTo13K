🔑 AWS CREDENTIALS SETUP GUIDE
================================

STEP 1: Get AWS Credentials
---------------------------
1. Go to AWS Console: https://console.aws.amazon.com
2. Navigate to: IAM → Users → [Your Username] → Security credentials
3. Click "Create access key"
4. Choose "Command Line Interface (CLI)"
5. Download the Access Key ID and Secret Access Key

STEP 2: Configure AWS CLI
-------------------------
Run this command and enter your details:

```bash
aws configure
```

Enter:
- AWS Access Key ID: [YOUR_ACCESS_KEY_ID]
- AWS Secret Access Key: [YOUR_SECRET_ACCESS_KEY]  
- Default region name: ap-southeast-1
- Default output format: json

STEP 3: Test Configuration
--------------------------
```bash
aws sts get-caller-identity
```

Should return your account info.

STEP 4: Deploy to SageMaker
---------------------------
```bash
python deploy_real_paid_sagemaker.py
```

This creates the actual endpoint (COSTS MONEY!)

STEP 5: Validate Deployment
---------------------------
```bash
python validate_aws_deployment.py
```

STEP 6: Run Demo with AWS
-------------------------
```bash
python run_demo.py
```

COST WARNING:
- SageMaker endpoint: $0.05-$0.10+ per hour (24/7)
- Inference calls: ~$0.001 per prediction
- Monthly cost: $36-$72+ until you delete it

TO STOP BILLING:
- AWS Console → SageMaker → Endpoints → Delete endpoint