🔑 GET AWS ACCESS KEYS (One-time setup)
=============================================

STEP 1: Go to AWS Console
------------------------
Visit: https://console.aws.amazon.com
Sign in to your AWS account

STEP 2: Navigate to IAM
----------------------
AWS Console → Search "IAM" → Click IAM

STEP 3: Create/Find User
-----------------------
IAM → Users → Create user (or use existing)
- Username: anything (e.g., "crowd-control-user")
- Access type: Programmatic access

STEP 4: Set Permissions
----------------------
Attach these policies:
- AmazonSageMakerFullAccess
- AmazonS3FullAccess  
- IAMFullAccess

STEP 5: Get Access Keys
----------------------
User → Security credentials → Create access key
- Use case: Command Line Interface (CLI)
- Download the CSV or copy:
  * Access Key ID: AKIA... 
  * Secret Access Key: abc123...

STEP 6: That's it!
-----------------
You're done with AWS Portal!
Everything else is automated.

NEXT: Run setup
--------------
python setup_aws.py

Then deploy:
-----------
python deploy_real_paid_sagemaker.py

The script will automatically create:
✅ S3 bucket
✅ IAM roles
✅ SageMaker model
✅ SageMaker endpoint
✅ Everything else!