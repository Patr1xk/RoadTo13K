# 🇲🇾 READY TO DEPLOY - API GATEWAY

## ✅ What you need to add in AWS Console:

### Go to IAM → Users → nareen → Permissions
Add these policies:
1. **AmazonAPIGatewayAdministrator**
2. **AWSLambda_FullAccess** (if not already there)

## 🚀 After adding permissions, run:

```bash
python simple_api_deploy.py
```

## 📡 You'll get these endpoints:

- `GET  https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/scenarios`
- `POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/demo/1` (KLCC)
- `POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/demo/2` (Stadium)
- `POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/demo/3` (Concert)

## 🎪 Perfect for your frontend demo!

Your frontend can call these endpoints directly and get JSON responses for all 3 Malaysian scenarios!

## 🧪 Test with curl:

```bash
# Get all scenarios
curl https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/scenarios

# Run KLCC demo
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/demo/1

# Run Stadium demo  
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/demo/2

# Run Concert demo
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/demo/3
```