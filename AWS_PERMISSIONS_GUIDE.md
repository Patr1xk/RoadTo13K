# 🇲🇾 AWS PERMISSIONS GUIDE FOR API GATEWAY

## ❌ Current Issue:
Your AWS user `nareen` doesn't have API Gateway permissions. You need to add these permissions in AWS Console.

## 🔧 Option 1: Add Permissions in AWS Console

### Step 1: Go to AWS Console
1. Login to [AWS Console](https://console.aws.amazon.com)
2. Go to **IAM** service
3. Click **Users** → Find user `nareen`

### Step 2: Add API Gateway Policy
1. Click **Add permissions** → **Attach policies directly**
2. Search for and attach these policies:
   - ✅ **AmazonAPIGatewayAdministrator**
   - ✅ **AWSLambda_FullAccess** (if not already attached)

### Step 3: Test Deployment
```bash
python simple_api_deploy.py
```

---

## 🚀 Option 2: Use Lambda Function URLs (NO API Gateway needed!)

**Simpler solution - use existing Lambda functions with direct URLs!**

Your Lambda functions can have direct HTTPS URLs without API Gateway:
- ✅ **No extra permissions needed**
- ✅ **Uses existing Lambda functions** 
- ✅ **Perfect for demo**

---

## 📝 Required Permissions for API Gateway:

If you want to add them manually:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "apigateway:*",
                "lambda:AddPermission",
                "lambda:RemovePermission"
            ],
            "Resource": "*"
        }
    ]
}
```

---

## 🎯 Recommended: Use Option 2 (Lambda URLs)

Want me to create Lambda Function URLs instead? They're simpler and work with your current permissions!