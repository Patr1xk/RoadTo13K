import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import random
from datetime import datetime, timezone
import uuid
import time
from decimal import Decimal
from backend.models import CrowdSimulation

class CrowdLiveEvents:
    def __init__(self):
        from config.settings import dynamodb
        self.dynamodb = dynamodb
        self.table_name = 'crowd_live_events'
        self._create_table_if_not_exists()
        self.table = self.dynamodb.Table(self.table_name)
    
    def _create_table_if_not_exists(self):
        try:
            table = self.dynamodb.Table(self.table_name)
            table.load()
            print(f'Table {self.table_name} already exists')
        except self.dynamodb.meta.client.exceptions.ResourceNotFoundException:
            table = self.dynamodb.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {'AttributeName': 'event_id', 'KeyType': 'HASH'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'event_id', 'AttributeType': 'S'}
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            table.wait_until_exists()
            print(f'Table {self.table_name} created successfully')
    
    def create_event(self, event_data):
        return self.table.put_item(Item=event_data)
    
    def get_all_events(self):
        response = self.table.scan()
        return response.get('Items', [])

def generate_live_event(base_event):
    new_event = base_event.copy()
    
    # Generate event ID following E001 format (E + 3 digits, starting from 501)
    new_event['event_id'] = f"E{random.randint(1, 999):03d}"
    new_event['timestamp'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

    # Randomly change density & expected crowd (convert Decimal to int)
    new_event['density_estimate'] = max(10, int(float(base_event['density_estimate']) * random.uniform(0.8, 1.2)))
    new_event['expected_crowd_size'] = max(100, int(float(base_event['expected_crowd_size']) * random.uniform(0.9, 1.1)))

    # Randomize gates
    new_event['gate_data'] = {k: random.choice(['Open', 'Closed']) for k in base_event['gate_data'].keys()}

    # Randomize heatmap proportionally to expected crowd
    total = new_event['expected_crowd_size']
    sections = list(base_event['heatmap_data'].keys())
    heatmap = {}
    remaining = total
    for s in sections[:-1]:
        val = random.randint(0, max(0, remaining))
        heatmap[s] = val
        remaining -= val
    heatmap[sections[-1]] = max(0, remaining)
    new_event['heatmap_data'] = heatmap

    # Remove risk level and recommendations (ML will predict)
    new_event.pop('risk_level', None)
    new_event.pop('recommendations', None)
    
    # Set status as Live
    new_event['status'] = 'Live'

    return new_event

def generate_multiple_live_events(count=50):
    import pandas as pd
    
    # Read CSV data directly
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dataset', 'synthetic_events_500.csv')
    df = pd.read_csv(csv_path)
    
    live_events = []
    used_ids = set()
    
    for i in range(count):
        # Pick random row from CSV
        base_row = df.sample(1).iloc[0]
        
        # Convert to proper format
        base_event = {
            "event_id": base_row["event_id"],
            "timestamp": base_row["timestamp"],
            "density_estimate": int(base_row["density_estimate"]),
            "expected_crowd_size": int(base_row["expected_crowd_size"]),
            "gate_data": {
                "GateA": base_row["GateA"],
                "GateB": base_row["GateB"],
                "GateC": base_row["GateC"],
                "GateD": base_row["GateD"]
            },
            "heatmap_data": {
                "Food Court": int(base_row["Food Court"]),
                "SectionA": int(base_row["SectionA"]),
                "SectionB": int(base_row["SectionB"]),
                "SectionC": int(base_row["SectionC"]),
                "SectionD": int(base_row["SectionD"]),
                "Toilet": int(base_row["Toilet"])
            },
            "recommendations": base_row["recommendations"].split(";") if ";" in str(base_row["recommendations"]) else [base_row["recommendations"]],
            "risk_level": base_row["risk_level"],
            "scenario_type": base_row["scenario_type"],
            "status": base_row["status"]
        }
        
        live_event = generate_live_event(base_event)
        
        # Ensure unique event ID
        while live_event['event_id'] in used_ids:
            live_event['event_id'] = f"E{random.randint(1, 999):03d}"
        
        used_ids.add(live_event['event_id'])
        live_events.append(live_event)
    
    return live_events

def simulate_live_data():
    import pandas as pd
    
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dataset', 'synthetic_events_500.csv')
    df = pd.read_csv(csv_path)
    live_db = CrowdLiveEvents()
    
    print("Starting live data simulation (every 2 seconds)...")
    print("Press Ctrl+C to stop")
    
    event_counter = 1
    
    try:
        while True:
            # Generate 3 events at once for faster demo
            for _ in range(3):
                # Pick random row from CSV
                base_row = df.sample(1).iloc[0]
                
                # Convert to proper format
                base_event = {
                    "event_id": base_row["event_id"],
                    "timestamp": base_row["timestamp"],
                    "density_estimate": int(base_row["density_estimate"]),
                    "expected_crowd_size": int(base_row["expected_crowd_size"]),
                    "gate_data": {
                        "GateA": base_row["GateA"],
                        "GateB": base_row["GateB"],
                        "GateC": base_row["GateC"],
                        "GateD": base_row["GateD"]
                    },
                    "heatmap_data": {
                        "Food Court": int(base_row["Food Court"]),
                        "SectionA": int(base_row["SectionA"]),
                        "SectionB": int(base_row["SectionB"]),
                        "SectionC": int(base_row["SectionC"]),
                        "SectionD": int(base_row["SectionD"]),
                        "Toilet": int(base_row["Toilet"])
                    },
                    "recommendations": base_row["recommendations"].split(";") if ";" in str(base_row["recommendations"]) else [base_row["recommendations"]],
                    "risk_level": base_row["risk_level"],
                    "scenario_type": base_row["scenario_type"],
                    "status": base_row["status"]
                }
                
                # Generate live event with sequential ID
                live_event = generate_live_event(base_event)
                live_event['event_id'] = f"E{event_counter:03d}"
                
                # Insert into database
                live_db.create_event(live_event)
                print(f'[{datetime.now().strftime("%H:%M:%S")}] Generated live event: {live_event["event_id"]} - Risk: {live_event.get("predicted_risk", "Pending ML")} - Crowd: {live_event["expected_crowd_size"]}')
                
                event_counter += 1
            
            time.sleep(2)  # Wait 2 seconds
            
    except KeyboardInterrupt:
        print("\nStopped live data simulation")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--live":
        simulate_live_data()
    elif len(sys.argv) > 1 and sys.argv[1] == "--demo":
        print("Demo mode: Fast simulation for 5 minutes")
        simulate_live_data()
    else:
        # Generate 50 live events (batch mode)
        live_events = generate_multiple_live_events(50)
        
        # Insert into live events table
        live_db = CrowdLiveEvents()
        with live_db.table.batch_writer() as batch:
            for event in live_events:
                batch.put_item(Item=event)
                print(f'Generated live event: {event["event_id"]}')
        
        print(f'Successfully generated {len(live_events)} live events in {live_db.table_name} table')
        print("\nTo run live simulation: python backend\\live_data_generator.py --live")