import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import random
from datetime import datetime, timezone
import uuid
import time
from decimal import Decimal
from backend.models import CrowdSimulation
import pandas as pd

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

    # Vary expected crowd size
    new_event['expected_crowd_size'] = max(100, int(base_event['expected_crowd_size'] * random.uniform(0.9, 1.1)))

    # Add realistic variations
    new_event['weather_condition'] = random.choice(['Clear', 'Cloudy', 'Light_Rain', 'Heavy_Rain'])
    new_event['crowd_outside'] = max(0, int(base_event['crowd_outside'] * random.uniform(0.8, 1.2)))
    
    # Vary queue lengths
    new_event['queue_data'] = {k: max(0, int(v * random.uniform(0.7, 1.3))) for k, v in base_event['queue_data'].items()}
    
    # Vary section occupancy
    new_event['heatmap_data'] = {k: max(0, int(v * random.uniform(0.9, 1.1))) for k, v in base_event['heatmap_data'].items()}

    # Remove ML prediction columns - these will be predicted by SageMaker
    new_event.pop('risk_level', None)
    new_event.pop('predicted_risk_next_15min', None)
    new_event.pop('bottleneck_prediction', None)
    new_event.pop('recommendations', None)
    
    # Set status as Live
    new_event['status'] = 'Live'

    return new_event

def generate_multiple_live_events(count=50):
    import pandas as pd
    
    # Read CSV data directly
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dataset', 'enhanced_crowd_flow.csv')
    df = pd.read_csv(csv_path)
    
    live_events = []
    used_ids = set()
    
    for i in range(count):
        # Pick random row from CSV
        base_row = df.sample(1).iloc[0]
        
        # Convert to proper format
        base_event = {
            "event_id": base_row["event_id"],
            "timestamp": base_row["time"],
            "scenario_phase": base_row["scenario_phase"],
            "weather_condition": base_row["weather_condition"],
            "crowd_outside": int(base_row["crowd_outside"]),
            "expected_crowd_size": int(base_row["crowd_outside"] + base_row["section_a"] + base_row["section_b"] + base_row["section_c"] + base_row["section_d"]),
            "gate_data": {
                "GateA": base_row["gate_a_status"],
                "GateB": base_row["gate_b_status"],
                "GateC": base_row["gate_c_status"],
                "GateD": base_row["gate_d_status"]
            },
            "queue_data": {
                "GateA": int(base_row["gate_a_queue"]),
                "GateB": int(base_row["gate_b_queue"]),
                "GateC": int(base_row["gate_c_queue"]),
                "GateD": int(base_row["gate_d_queue"])
            },
            "heatmap_data": {
                "Food Court": int(base_row["food_court"]),
                "SectionA": int(base_row["section_a"]),
                "SectionB": int(base_row["section_b"]),
                "SectionC": int(base_row["section_c"]),
                "SectionD": int(base_row["section_d"]),
                "Toilet": int(base_row["toilet"])
            },
            "transport_arrival_next_10min": int(base_row["transport_arrival_next_10min"]),
            "crowd_growth_rate": Decimal(str(base_row["crowd_growth_rate"])),
            "facility_demand_forecast": base_row["facility_demand_forecast"],
            "parking_occupancy_percent": Decimal(str(base_row["parking_occupancy_percent"])),
            "emergency_status": base_row["emergency_status"],
            "staff_security": int(base_row["staff_security"]),
            "staff_food": int(base_row["staff_food"]),
            "staff_medical": int(base_row["staff_medical"]),
            "vip_early_entry": base_row["vip_early_entry"],
            # Keep original predictions for training data reference
            "original_risk_level": base_row["risk_level"],
            "original_predicted_risk_next_15min": base_row["predicted_risk_next_15min"],
            "original_bottleneck_prediction": base_row["bottleneck_prediction"],
            "original_recommended_action": base_row["recommended_action"],
            "scenario_type": base_row["scenario_phase"],
            "status": "Live"
        }
        
        live_event = generate_live_event(base_event)
        
        # Ensure unique event ID
        while live_event['event_id'] in used_ids:
            live_event['event_id'] = f"E{random.randint(1, 999):03d}"
        
        used_ids.add(live_event['event_id'])
        live_events.append(live_event)
    
    return live_events

def simulate_single_event():
    """Simulate one complete event lifecycle (2 hours)"""
    import pandas as pd
    
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dataset', 'training_data_500.csv')
    df = pd.read_csv(csv_path)
    live_db = CrowdLiveEvents()
    
    # Get one complete event (all phases for one event_id)
    event_ids = df['event_id'].str.extract(r'(E\d+)_')[0].unique()
    selected_event = random.choice(event_ids)
    event_data = df[df['event_id'].str.startswith(selected_event)].sort_values('event_id')
    
    print(f"Starting live simulation of {selected_event} ({len(event_data)} phases)...")
    print("Press Ctrl+C to stop")
    
    try:
        for idx, (_, row) in enumerate(event_data.iterrows()):
            base_event = {
                "event_id": row["event_id"],
                "timestamp": row["time"],
                "scenario_phase": row["scenario_phase"],
                "weather_condition": row["weather_condition"],
                "crowd_outside": int(row["crowd_outside"]),
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
                "transport_arrival_next_10min": int(row["transport_arrival_next_10min"]),
                "crowd_growth_rate": Decimal(str(row["crowd_growth_rate"])),
                "facility_demand_forecast": row["facility_demand_forecast"],
                "parking_occupancy_percent": Decimal(str(row["parking_occupancy_percent"])),
                "emergency_status": row["emergency_status"],
                "staff_security": int(row["staff_security"]),
                "staff_food": int(row["staff_food"]),
                "staff_medical": int(row["staff_medical"]),
                "vip_early_entry": row["vip_early_entry"],
                "original_risk_level": row["risk_level"],
                "original_predicted_risk_next_15min": row["predicted_risk_next_15min"],
                "original_bottleneck_prediction": row["bottleneck_prediction"],
                "original_recommended_action": row["recommended_action"],
                "scenario_type": row["scenario_phase"],
                "status": "Live"
            }
            
            # Remove prediction columns - these need to be predicted by ML
            base_event.pop('original_risk_level', None)
            base_event.pop('original_predicted_risk_next_15min', None) 
            base_event.pop('original_bottleneck_prediction', None)
            base_event.pop('original_recommended_action', None)
            
            live_event = generate_live_event(base_event)
            live_event['event_id'] = row["event_id"]
            live_event['timestamp'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
            
            # Store original predictions separately for validation (not sent to ML)
            live_event['_validation_data'] = {
                'expected_risk_level': row["risk_level"],
                'expected_predicted_risk': row["predicted_risk_next_15min"],
                'expected_bottleneck': row["bottleneck_prediction"],
                'expected_action': row["recommended_action"]
            }
            
            live_db.create_event(live_event)
            print(f'[{datetime.now().strftime("%H:%M:%S")}] Phase {idx+1}/{len(event_data)}: {live_event["scenario_phase"]} - Outside: {live_event["crowd_outside"]} - Risk: {live_event["original_risk_level"]}')
            
            time.sleep(3)  # 3 seconds between phases
            
        print(f"\nCompleted simulation of {selected_event}!")
            
    except KeyboardInterrupt:
        print("\nStopped event simulation")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--live":
        simulate_single_event()
    elif len(sys.argv) > 1 and sys.argv[1] == "--demo":
        print("Demo mode: Single event simulation")
        simulate_single_event()
    else:
        # Generate 50 live events (batch mode)
        live_events = generate_multiple_live_events(50)
        
        # Insert into live events table
        live_db = CrowdLiveEvents()
        with live_db.table.batch_writer() as batch:
            for event in live_events:
                batch.put_item(Item=event)
                print(f'Generated live event: {event["event_id"]}')
        
        print(f'Successfully generated {len(live_events)} live events from enhanced_crowd_flow.csv in {live_db.table_name} table')
        print("\nTo run live simulation: python backend\\live_data_generator.py --live")