import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import boto3
from config.settings import dynamodb

import pandas as pd
import json

# Create table if it doesn't exist
try:
    table = dynamodb.Table('crowd_simulation')
    table.load()  # Check if table exists
    print('Table already exists')
except dynamodb.meta.client.exceptions.ResourceNotFoundException:
    table = dynamodb.create_table(
        TableName='crowd_simulation',
        KeySchema=[
            {'AttributeName': 'event_id', 'KeyType': 'HASH'}
        ],
        AttributeDefinitions=[
            {'AttributeName': 'event_id', 'AttributeType': 'S'}
        ],
        BillingMode='PAY_PER_REQUEST'
    )
    table.wait_until_exists()
    print('Table created successfully')

# Read CSV file
df = pd.read_csv('dataset\\synthetic_events_500.csv')

# Function to convert row to nested JSON
def row_to_nosql(row):
    return {
        "event_id": row["event_id"],
        "timestamp": row["timestamp"],
        "density_estimate": int(row["density_estimate"]),
        "expected_crowd_size": int(row["expected_crowd_size"]),
        "gate_data": {
            "GateA": row["GateA"],
            "GateB": row["GateB"],
            "GateC": row["GateC"],
            "GateD": row["GateD"]
        },
        "heatmap_data": {
            "Food Court": int(row["Food Court"]),
            "SectionA": int(row["SectionA"]),
            "SectionB": int(row["SectionB"]),
            "SectionC": int(row["SectionC"]),
            "SectionD": int(row["SectionD"]),
            "Toilet": int(row["Toilet"])
        },
        "recommendations": row["recommendations"].split(";"),  # convert back to list
        "risk_level": row["risk_level"],
        "scenario_type": row["scenario_type"],
        "status": row["status"]
    }


# Convert all rows
nosql_data = [row_to_nosql(row) for _, row in df.iterrows()]

# Insert into DynamoDB using batch operations (much faster)
with table.batch_writer() as batch:
    for i, item in enumerate(nosql_data):
        batch.put_item(Item=item)
        if (i + 1) % 25 == 0:  # Print progress every 25 items
            print(f'Inserted {i + 1}/{len(nosql_data)} items')

print(f'Successfully inserted {len(nosql_data)} events into DynamoDB')

# Also save to JSON file for backup
# with open("synthetic_events_500_nosql.json", "w") as f:
#     json.dump(nosql_data, f, indent=4)
# print('JSON backup file created')
