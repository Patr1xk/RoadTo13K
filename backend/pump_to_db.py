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
df = pd.read_csv('dataset\\enhanced_crowd_flow_enhance.csv')

# Function to convert row to nested JSON
def row_to_nosql(row):
    from decimal import Decimal
    return {
        "event_id": row["event_id"],
        "timestamp": row["time"],
        "scenario_phase": row["scenario_phase"],
        "weather_condition": row["weather_condition"],
        "crowd_outside": int(row["crowd_outside"]),
        "transport_arrival_next_10min": int(row["transport_arrival_next_10min"]),
        "crowd_growth_rate": Decimal(str(row["crowd_growth_rate"])),
        "expected_crowd_size": int(row["crowd_outside"] + row["section_a"] + row["section_b"] + row["section_c"] + row["section_d"]),
        "gate_data": {
            "GateA": row["gate_a_status"],
            "GateB": row["gate_b_status"],
            "GateC": row["gate_c_status"],
            "GateD": row["gate_d_status"]
        },
        "queue_data": {
            "GateA": int(row["gate_a_queue"]),
            "GateB": int(row["gate_b_queue"]),
            "GateC": int(row["gate_c_queue"]),
            "GateD": int(row["gate_d_queue"])
        },
        "heatmap_data": {
            "Food Court": int(row["food_court"]),
            "SectionA": int(row["section_a"]),
            "SectionB": int(row["section_b"]),
            "SectionC": int(row["section_c"]),
            "SectionD": int(row["section_d"]),
            "Toilet": int(row["toilet"])
        },
        "facility_demand_forecast": row["facility_demand_forecast"],
        "parking_occupancy_percent": Decimal(str(row["parking_occupancy_percent"])),
        "emergency_status": row["emergency_status"],
        "staff_security": int(row["staff_security"]),
        "staff_food": int(row["staff_food"]),
        "staff_medical": int(row["staff_medical"]),
        "vip_early_entry": bool(row["vip_early_entry"]),
        "risk_level": row["risk_level"],
        "predicted_risk_next_15min": row["predicted_risk_next_15min"],
        "bottleneck_prediction": row["bottleneck_prediction"],
        "recommended_action": row["recommended_action"],
        "scenario_type": row["scenario_phase"],
        "status": "Historical"
    }


# Convert all rows (now all IDs are unique)
nosql_data = [row_to_nosql(row) for _, row in df.iterrows()]

# Batch insert - should work perfectly now
with table.batch_writer() as batch:
    for i, item in enumerate(nosql_data):
        batch.put_item(Item=item)
        if (i + 1) % 25 == 0:
            print(f'Inserted {i + 1}/{len(nosql_data)} items')

print(f'Completed processing {len(nosql_data)} events')

# Also save to JSON file for backup
# with open("synthetic_events_500_nosql.json", "w") as f:
#     json.dump(nosql_data, f, indent=4)
# print('JSON backup file created')
