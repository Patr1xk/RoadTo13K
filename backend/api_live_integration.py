#!/usr/bin/env python3
"""
API Integration for Live Simulation
===================================
Provides Lambda-compatible functions for real DynamoDB integration
"""

import json
import boto3
import time
import random
from datetime import datetime, timezone
from decimal import Decimal

class APILiveSimulation:
    """Lightweight live simulation for API Gateway integration"""
    
    def __init__(self):
        self.dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        self.table_name = 'crowd_live_events'
        
    def create_table_if_not_exists(self):
        """Create DynamoDB table if it doesn't exist"""
        try:
            table = self.dynamodb.Table(self.table_name)
            table.load()
            return table
        except:
            # Create table
            table = self.dynamodb.create_table(
                TableName=self.table_name,
                KeySchema=[
                    {'AttributeName': 'event_id', 'KeyType': 'HASH'},
                    {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'event_id', 'AttributeType': 'S'},
                    {'AttributeName': 'timestamp', 'AttributeType': 'S'}
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            table.wait_until_exists()
            return table
    
    def generate_live_event(self, scenario_type="concert_entry_rush"):
        """Generate a single live event with real predictions"""
        
        # Malaysian scenarios
        scenarios = {
            'concert_entry_rush': {
                'name': 'Concert Entry Rush - Axiata Arena',
                'location': 'Bukit Jalil, KL',
                'crowd_multiplier': 1.5,
                'base_crowd': 800
            },
            'stadium_exit_wave': {
                'name': 'Stadium Exit - Bukit Jalil National Stadium', 
                'location': 'Bukit Jalil, KL',
                'crowd_multiplier': 2.0,
                'base_crowd': 1200
            },
            'festival_congestion': {
                'name': 'Thaipusam Festival Congestion',
                'location': 'Batu Caves, Selangor',
                'crowd_multiplier': 1.3,
                'base_crowd': 600
            }
        }
        
        scenario = scenarios.get(scenario_type, scenarios['concert_entry_rush'])
        
        # Generate realistic crowd data
        crowd_density = random.uniform(0.4, 0.9)
        predicted_count = int(scenario['base_crowd'] * crowd_density * scenario['crowd_multiplier'])
        
        # AI Predictions
        risk_score = crowd_density * 0.8 + random.uniform(0.1, 0.2)
        
        if risk_score > 0.7:
            risk_level = "high"
            action = "Deploy additional crowd control staff immediately"
        elif risk_score > 0.5:
            risk_level = "medium" 
            action = "Monitor closely and prepare additional resources"
        else:
            risk_level = "low"
            action = "Continue standard monitoring"
        
        # Create event data
        event_data = {
            'event_id': f"live_event_{int(time.time())}_{random.randint(1000, 9999)}",
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'scenario_type': scenario_type,
            'scenario_name': scenario['name'],
            'location': scenario['location'],
            'crowd_count': Decimal(str(predicted_count)),
            'crowd_density': Decimal(str(round(crowd_density, 3))),
            'risk_score': Decimal(str(round(risk_score, 3))),
            'risk_level': risk_level,
            'recommended_action': action,
            'confidence_score': Decimal(str(round(random.uniform(0.8, 0.95), 3))),
            'processing_time_ms': Decimal(str(random.randint(150, 300))),
            'weather_condition': random.choice(['Clear', 'Cloudy', 'Light_Rain']),
            'temperature_c': Decimal(str(random.randint(26, 35))),
            'api_triggered': True,
            'system_version': 'API_v2.0'
        }
        
        return event_data
    
    def run_api_demo(self, duration_seconds=30):
        """Run a live demo that actually writes to DynamoDB"""
        
        table = self.create_table_if_not_exists()
        
        scenarios = ['concert_entry_rush', 'stadium_exit_wave', 'festival_congestion']
        results = []
        
        print(f"🚀 Starting API live demo for {duration_seconds} seconds...")
        
        start_time = time.time()
        event_count = 0
        
        while (time.time() - start_time) < duration_seconds:
            scenario = random.choice(scenarios)
            event_data = self.generate_live_event(scenario)
            
            # Store in DynamoDB
            try:
                table.put_item(Item=event_data)
                event_count += 1
                
                # Convert Decimal back to float for JSON response
                json_event = {}
                for key, value in event_data.items():
                    if isinstance(value, Decimal):
                        json_event[key] = float(value)
                    else:
                        json_event[key] = value
                
                results.append(json_event)
                
                print(f"✅ Event {event_count}: {event_data['scenario_name']} - Risk: {event_data['risk_level']}")
                
            except Exception as e:
                print(f"❌ Error storing event: {e}")
            
            time.sleep(2)  # Wait 2 seconds between events
        
        demo_summary = {
            'total_events_generated': event_count,
            'duration_seconds': int(time.time() - start_time),
            'scenarios_tested': scenarios,
            'events': results[-5:],  # Last 5 events
            'dynamodb_table': self.table_name,
            'status': 'completed'
        }
        
        return demo_summary

# Lambda-compatible functions
def lambda_run_demo():
    """Lambda function to run live demo"""
    simulator = APILiveSimulation()
    return simulator.run_api_demo(duration_seconds=25)  # 25 seconds for Lambda timeout

def lambda_get_recent_events():
    """Lambda function to get recent events from DynamoDB"""
    try:
        dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
        table = dynamodb.Table('crowd_live_events')
        
        # Get last 10 events
        response = table.scan(Limit=10)
        events = response.get('Items', [])
        
        # Convert Decimals to floats for JSON
        json_events = []
        for event in events:
            json_event = {}
            for key, value in event.items():
                if isinstance(value, Decimal):
                    json_event[key] = float(value)
                else:
                    json_event[key] = value
            json_events.append(json_event)
        
        # Sort by timestamp (most recent first)
        json_events.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return {
            'recent_events': json_events[:5],
            'total_events_found': len(json_events),
            'table_name': 'crowd_live_events',
            'query_time': datetime.now(timezone.utc).isoformat()
        }
        
    except Exception as e:
        return {
            'error': str(e),
            'recent_events': [],
            'total_events_found': 0
        }

if __name__ == "__main__":
    # Test the API integration
    print("Testing API Live Integration...")
    simulator = APILiveSimulation()
    results = simulator.run_api_demo(duration_seconds=10)
    print("\nDemo Results:")
    print(json.dumps(results, indent=2))