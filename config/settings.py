from dotenv import load_dotenv
import os
import boto3

# Load .env file
load_dotenv()

# Create boto3 session with session token
session = boto3.session.Session(
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
    region_name=os.getenv("AWS_DEFAULT_REGION")
)

# Example: check identity
sts = session.client("sts")
identity = sts.get_caller_identity()
print("Connected as:", identity)
