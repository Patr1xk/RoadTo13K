import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import random
from datetime import datetime, timezone, timedelta
import uuid
import time
from decimal import Decimal
from backend.models import CrowdSimulation
import pandas as pd
import json
import asyncio
from threading import Thread
import warnings
warnings.filterwarnings('ignore')

class EnhancedCrowdLiveEvents:
    def __init__(self):
        from config.settings import dynamodb
        self.dynamodb = dynamodb
        self.table_name = 'crowd_live_events'
        self._create_table_if_not_exists()
        self.table = self.dynamodb.Table(self.table_name)
        
        # Initialize ML system (with error handling for AWS connection delays)
        self.ml_system = None
        self._init_ml_system()
        
        # Real-time scenarios for Malaysian events
        self.malaysian_scenarios = {
            'concert_entry_rush': {
                'name': 'Concert Entry Rush - KL Convention Centre',
                'peak_times': ['19:00', '19:30', '20:00'],
                'crowd_multiplier': 1.5,
                'weather_impact': {'Heavy_Rain': 0.8, 'Light_Rain': 0.9, 'Cloudy': 1.0, 'Clear': 1.1}
            },
            'stadium_exit_wave': {
                'name': 'Stadium Exit - Bukit Jalil National Stadium',
                'peak_times': ['22:00', '22:15', '22:30'],
                'crowd_multiplier': 2.0,
                'parking_impact': 1.8
            },
            'festival_congestion': {
                'name': 'Thaipusam/Hari Raya Festival Congestion',
                'peak_times': ['12:00', '14:00', '16:00', '18:00'],
                'crowd_multiplier': 1.3,
                'food_court_surge': 2.5
            }
        }
        
        # Live streaming configuration
        self.streaming_active = False
        self.stream_interval = 15  # seconds
        
    def _init_ml_system(self):
        """Initialize ML system with error handling"""
        try:
            print("🤖 Initializing enhanced ML system for real-time predictions...")
            from backend.sagemaker_ml import SageMakerML
            self.ml_system = SageMakerML()
            print("✅ ML system ready for real-time predictions")
        except Exception as e:
            print(f"⚠️ ML system initialization delayed: {str(e)[:100]}...")
            print("   Will retry during first prediction")
            self.ml_system = None
    
    def _create_table_if_not_exists(self):
        try:
            table = self.dynamodb.Table(self.table_name)
            table.load()
            print(f'✅ Table {self.table_name} already exists')
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
            print(f'✅ Table {self.table_name} created successfully')
    
    def create_event(self, event_data):
        """Create event with real-time ML prediction"""
        try:
            # Add ML prediction if system is available
            if self.ml_system:
                try:
                    ml_prediction = self.ml_system.predict(event_data)
                    event_data.update(ml_prediction)
                    event_data['prediction_timestamp'] = datetime.now(timezone.utc).isoformat()
                    event_data['prediction_source'] = 'SageMaker_Enhanced'
                except Exception as e:
                    print(f"⚠️ ML prediction failed: {e}")
                    event_data['prediction_error'] = str(e)
            
            return self.table.put_item(Item=event_data)
        except Exception as e:
            print(f"❌ Event creation failed: {e}")
            return None
    
    def get_all_events(self):
        response = self.table.scan()
        return response.get('Items', [])
    
    def start_real_time_simulation(self, scenario_type='concert_entry_rush', duration_minutes=30):
        """Start real-time crowd simulation for Malaysian events"""
        print(f"🚀 Starting real-time simulation: {self.malaysian_scenarios[scenario_type]['name']}")
        print(f"⏱️ Duration: {duration_minutes} minutes")
        
        self.streaming_active = True
        
        # Run simulation in separate thread
        sim_thread = Thread(target=self._run_simulation, args=(scenario_type, duration_minutes))
        sim_thread.daemon = True
        sim_thread.start()
        
        return f"Real-time simulation started for {scenario_type}"
    
    def _run_simulation(self, scenario_type, duration_minutes):
        """Run the real-time simulation"""
        start_time = datetime.now()
        end_time = start_time + timedelta(minutes=duration_minutes)
        
        scenario_config = self.malaysian_scenarios[scenario_type]
        base_event = self._create_base_scenario(scenario_type)
        
        event_counter = 1
        
        while datetime.now() < end_time and self.streaming_active:
            try:
                # Generate live event with scenario-specific dynamics
                live_event = self._generate_scenario_event(base_event, scenario_config, event_counter)
                
                # Create event with ML prediction
                result = self.create_event(live_event)
                
                if result:
                    print(f"📊 Live Event {event_counter}: {live_event['scenario_phase']} - "
                          f"Risk: {live_event.get('risk_level', 'Predicting...')}")
                
                event_counter += 1
                time.sleep(self.stream_interval)
                
            except Exception as e:
                print(f"❌ Simulation error: {e}")
                time.sleep(5)  # Wait before retrying
        
        print(f"✅ Simulation completed: {event_counter-1} events generated")
        self.streaming_active = False
    
    def _create_base_scenario(self, scenario_type):
        """Create base event for specific Malaysian scenarios"""
        
        if scenario_type == 'concert_entry_rush':
            return {
                'event_type': 'Concert',
                'venue': 'KL Convention Centre',
                'expected_crowd_size': 8000,
                'scenario_phase': 'entry_start',
                'weather_condition': 'Clear',
                'crowd_outside': 200,
                'transport_arrival_next_10min': 150,
                'crowd_growth_rate': 45.0,
                'queue_data': {'GateA': 50, 'GateB': 30, 'GateC': 20, 'GateD': 15},
                'heatmap_data': {'SectionA': 100, 'SectionB': 80, 'SectionC': 90, 'SectionD': 70, 'Food Court': 25, 'Toilet': 15},
                'parking_occupancy_percent': 45.0,
                'staff_security': 12,
                'staff_food': 6,
                'staff_medical': 4
            }
        
        elif scenario_type == 'stadium_exit_wave':
            return {
                'event_type': 'Football Match',
                'venue': 'Bukit Jalil National Stadium',
                'expected_crowd_size': 50000,
                'scenario_phase': 'exit_start',
                'weather_condition': 'Clear',
                'crowd_outside': 0,
                'transport_arrival_next_10min': 200,
                'crowd_growth_rate': -85.0,
                'queue_data': {'GateA': 0, 'GateB': 0, 'GateC': 0, 'GateD': 0},
                'heatmap_data': {'SectionA': 2500, 'SectionB': 2800, 'SectionC': 2600, 'SectionD': 2400, 'Food Court': 150, 'Toilet': 200},
                'parking_occupancy_percent': 95.0,
                'staff_security': 25,
                'staff_food': 15,
                'staff_medical': 8
            }
        
        elif scenario_type == 'festival_congestion':
            return {
                'event_type': 'Cultural Festival',
                'venue': 'Batu Caves / Central Market',
                'expected_crowd_size': 15000,
                'scenario_phase': 'event_active',
                'weather_condition': random.choice(['Clear', 'Cloudy', 'Light_Rain']),
                'crowd_outside': 300,
                'transport_arrival_next_10min': 80,
                'crowd_growth_rate': 25.0,
                'queue_data': {'GateA': 40, 'GateB': 35, 'GateC': 45, 'GateD': 30},
                'heatmap_data': {'SectionA': 800, 'SectionB': 750, 'SectionC': 900, 'SectionD': 650, 'Food Court': 200, 'Toilet': 120},
                'parking_occupancy_percent': 75.0,
                'staff_security': 18,
                'staff_food': 25,
                'staff_medical': 6
            }
    
    def _generate_scenario_event(self, base_event, scenario_config, counter):
        """Generate event with scenario-specific dynamics"""
        live_event = base_event.copy()
        
        # Generate unique event ID
        live_event['event_id'] = f"LIVE_{scenario_config['name'][:3].upper()}_{counter:04d}"
        live_event['timestamp'] = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
        
        # Apply scenario-specific crowd dynamics
        if 'crowd_multiplier' in scenario_config:
            multiplier = scenario_config['crowd_multiplier']
            # Add some randomness
            multiplier *= random.uniform(0.8, 1.2)
            
            # Update crowd-related fields
            for key in ['crowd_outside', 'transport_arrival_next_10min']:
                if key in live_event:
                    live_event[key] = int(live_event[key] * multiplier)
        
        # Apply weather impact if configured
        if 'weather_impact' in scenario_config:
            weather = random.choice(['Clear', 'Cloudy', 'Light_Rain', 'Heavy_Rain'])
            live_event['weather_condition'] = weather
            
            if weather in scenario_config['weather_impact']:
                impact = scenario_config['weather_impact'][weather]
                live_event['crowd_outside'] = int(live_event['crowd_outside'] * impact)
        
        # Dynamic queue variations
        for gate, base_queue in live_event['queue_data'].items():
            # Add realistic queue fluctuations
            variation = random.uniform(0.7, 1.4)
            live_event['queue_data'][gate] = max(0, int(base_queue * variation))
        
        # Food court surge for festivals
        if 'food_court_surge' in scenario_config:
            surge = scenario_config['food_court_surge']
            live_event['heatmap_data']['Food Court'] = int(
                live_event['heatmap_data']['Food Court'] * surge * random.uniform(0.8, 1.2)
            )
        
        # Parking impact for stadium exits
        if 'parking_impact' in scenario_config:
            impact = scenario_config['parking_impact']
            live_event['parking_occupancy_percent'] = min(100, 
                live_event['parking_occupancy_percent'] * impact * random.uniform(0.9, 1.1)
            )
        
        # Evolve scenario phase based on time and type
        live_event['scenario_phase'] = self._get_dynamic_phase(live_event, counter)
        
        return live_event
    
    def _get_dynamic_phase(self, event, counter):
        """Dynamic phase progression based on event type and time"""
        event_type = event.get('event_type', 'Concert')
        
        if event_type == 'Concert':
            if counter <= 5:
                return 'pre_event'
            elif counter <= 15:
                return 'entry_start'
            elif counter <= 25:
                return 'entry_rush'
            elif counter <= 30:
                return 'entry_complete'
            else:
                return 'event_active'
        
        elif event_type == 'Football Match':
            if counter <= 10:
                return 'event_end'
            elif counter <= 20:
                return 'exit_start'
            elif counter <= 35:
                return 'exit_rush'
            else:
                return 'exit_complete'
        
        elif event_type == 'Cultural Festival':
            phases = ['event_active', 'halftime_prep', 'halftime_peak', 'halftime_return']
            return random.choice(phases)
        
        return 'event_active'
    
    def stop_simulation(self):
        """Stop the real-time simulation"""
        self.streaming_active = False
        print("🛑 Real-time simulation stopped")

# Legacy compatibility
CrowdLiveEvents = EnhancedCrowdLiveEvents

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
    from decimal import Decimal
    
    csv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'dataset', 'enhanced_crowd_flow_enhance.csv')
    df = pd.read_csv(csv_path)
    live_db = CrowdLiveEvents()
    
    # Get one complete event (all phases for one event_id)
    event_ids = df['event_id'].str.extract(r'(E\d+)_')[0].unique()
    selected_event = random.choice(event_ids)
    event_data = df[df['event_id'].str.startswith(selected_event)].sort_values('event_id')
    
    print(f"Starting live simulation of {selected_event} ({len(event_data)} phases)...")
    print("SageMaker predictions enabled")
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
            
            # Get ML predictions from SageMaker
            # Initialize ML system for predictions
            try:
                from backend.sagemaker_ml import SageMakerML
                ml_predictor = SageMakerML()
            except Exception as e:
                print(f"⚠️ ML system not available: {e}")
                ml_predictor = None
            predictions = ml_predictor.predict(live_event)
            
            # Add predictions to live event (convert floats to Decimal for DynamoDB)
            from decimal import Decimal
            for key, value in predictions.items():
                if isinstance(value, float):
                    live_event[key] = Decimal(str(value))
                else:
                    live_event[key] = value
            
            live_db.create_event(live_event)
            print(f'[{datetime.now().strftime("%H:%M:%S")}] Phase {idx+1}/{len(event_data)}: {live_event["scenario_phase"]} - Predicted Risk: {predictions["risk_level"]} - Action: {predictions["recommended_action"]}')
            
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