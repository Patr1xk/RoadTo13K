import pandas as pd
import random
from datetime import datetime, timedelta

def generate_event_data(event_num, base_capacity=200):
    """Generate complete event lifecycle data"""
    data = []
    event_id = f"E{event_num:03d}"
    
    # Event phases with realistic timing
    phases = [
        ("pre_event", 4),      # 1 hour pre-event (4 x 15min)
        ("entry_start", 4),    # 15 minutes entry
        ("entry_rush", 4),     # 15 minutes rush
        ("entry_complete", 1), # 5 minutes
        ("event_active", 8),   # 2 hours active
        ("halftime_prep", 1),  # 15 minutes
        ("halftime_exit", 1),  # 15 minutes  
        ("halftime_peak", 1),  # 15 minutes
        ("halftime_return", 2), # 30 minutes
        ("event_active", 4),   # 1 hour second half
        ("event_end", 1),      # 5 minutes
        ("exit_start", 1),     # 5 minutes
        ("exit_rush", 3),      # 15 minutes
        ("exit_complete", 3)   # 15 minutes
    ]
    
    start_time = datetime.strptime("09:00:00Z", "%H:%M:%SZ")
    time_counter = 1
    
    # Event characteristics
    max_crowd = random.randint(100, 600)
    weather_conditions = ["Clear", "Cloudy", "Light_Rain", "Heavy_Rain"]
    
    for phase, duration in phases:
        for i in range(duration):
            current_time = start_time + timedelta(minutes=(time_counter-1)*15 if phase == "pre_event" else (time_counter-1)*5)
            
            # Generate realistic data based on phase
            if phase == "pre_event":
                crowd_outside = min(max_crowd * (time_counter/4) * 0.4, max_crowd * 0.8)
                transport = random.randint(0, 150) if time_counter > 2 else 0
                queues = [0, 0, 0, 0]
                gate_status = ["Closed"] * 4
                sections = [0, 0, 0, 0]
                risk = "Low" if time_counter < 3 else "Medium"
                
            elif phase in ["entry_start", "entry_rush"]:
                crowd_outside = max(0, max_crowd - (time_counter-4)*50)
                transport = random.randint(80, 150)
                
                if time_counter <= 6:  # First gate only
                    queues = [random.randint(50, 200), 0, 0, 0]
                    gate_status = ["Open", "Closed", "Closed", "Closed"]
                elif time_counter <= 8:  # Two gates
                    queues = [random.randint(40, 120), random.randint(40, 120), 0, 0]
                    gate_status = ["Open", "Open", "Closed", "Closed"]
                else:  # All gates
                    queues = [random.randint(20, 80) for _ in range(4)]
                    gate_status = ["Open"] * 4
                
                sections = [sum(queues[:i+1]) for i in range(4)]
                risk = "Critical" if max(queues) > 150 else "High"
                
            elif phase == "entry_complete":
                crowd_outside = 0
                transport = 0
                queues = [0, 0, 0, 0]
                gate_status = ["Closed"] * 4
                sections = [max_crowd//4] * 4
                risk = "Low"
                
            elif phase == "event_active":
                crowd_outside = 0
                transport = 0
                queues = [0, 0, 0, 0]
                gate_status = ["Closed"] * 4
                sections = [max_crowd//4] * 4
                risk = "Low"
                
            elif "halftime" in phase:
                crowd_outside = random.randint(0, max_crowd//3) if "exit" in phase else 0
                transport = 0
                queues = [0, 0, 0, 0]
                gate_status = ["Closed"] * 4
                sections = [random.randint(max_crowd//6, max_crowd//3) for _ in range(4)]
                risk = "Medium" if "peak" in phase else "Low"
                
            elif "exit" in phase:
                crowd_outside = 0
                transport = random.randint(30, 80)
                
                if phase == "exit_start":
                    queues = [random.randint(50, 150), 0, 0, 0]
                    gate_status = ["Open", "Closed", "Closed", "Closed"]
                else:
                    queues = [random.randint(20, 100) for _ in range(4)]
                    gate_status = ["Open"] * 4
                
                sections = [max(0, max_crowd//4 - sum(queues)//4) for _ in range(4)]
                risk = "Medium" if max(queues) > 100 else "Low"
            
            # Common fields
            weather = random.choice(weather_conditions)
            growth_rate = ((crowd_outside - (data[-1]['crowd_outside'] if data else 0)) / max(1, data[-1]['crowd_outside'] if data else 1)) * 100 if data else 0
            
            food_court = random.randint(0, max_crowd//2) if "halftime" in phase else random.randint(0, max_crowd//8)
            toilet = random.randint(0, max_crowd//3) if "halftime" in phase else random.randint(0, max_crowd//10)
            
            facility_demand = "Critical_Food_Demand" if food_court > max_crowd//3 else "High_Food_Demand" if food_court > max_crowd//6 else "Medium_Facility_Demand" if any(s > max_crowd//6 for s in sections) else "Low_Facility_Demand"
            
            parking = min(95, random.randint(5, 85))
            
            staff_security = 12 if risk == "Critical" else 7 if risk == "High" else 5
            staff_food = 6 if "halftime" in phase else 3
            staff_medical = 3 if risk in ["High", "Critical"] else 2
            
            vip_early = time_counter == 3 and random.choice([True, False])
            
            predicted_risk = "Critical" if max(queues) > 150 else "High" if max(queues) > 80 else "Medium" if any(q > 40 for q in queues) else "Low"
            
            bottleneck = "Gate_A_Bottleneck" if queues[0] > 150 else "Food_Court_Bottleneck" if food_court > max_crowd//3 else "Toilet_Bottleneck" if toilet > max_crowd//4 else "No_Bottleneck"
            
            # Recommended actions
            if bottleneck != "No_Bottleneck":
                if "Gate" in bottleneck:
                    action = "open_all_gates" if queues[0] > 200 else "open_gate_b_critical"
                elif "Food" in bottleneck:
                    action = "manage_food_queue"
                else:
                    action = "deploy_food_staff"
            elif phase == "pre_event":
                action = "prepare_gates" if time_counter > 2 else "monitor_only"
            elif "entry" in phase:
                action = "balanced_flow" if all(q < 60 for q in queues) else "open_gate_c"
            elif "exit" in phase:
                action = "balanced_exit" if len([s for s in gate_status if s == "Open"]) > 2 else "open_more_exits"
            else:
                action = "normal_operations"
            
            row = {
                'event_id': f"{event_id}_T{time_counter:02d}",
                'time': current_time.strftime("%H:%M:%SZ"),
                'scenario_phase': phase,
                'weather_condition': weather,
                'crowd_outside': int(crowd_outside),
                'transport_arrival_next_10min': transport,
                'crowd_growth_rate': round(growth_rate, 1),
                'gate_a_queue': queues[0],
                'gate_b_queue': queues[1], 
                'gate_c_queue': queues[2],
                'gate_d_queue': queues[3],
                'gate_a_status': gate_status[0],
                'gate_b_status': gate_status[1],
                'gate_c_status': gate_status[2],
                'gate_d_status': gate_status[3],
                'section_a': sections[0],
                'section_b': sections[1],
                'section_c': sections[2], 
                'section_d': sections[3],
                'food_court': food_court,
                'toilet': toilet,
                'facility_demand_forecast': facility_demand,
                'parking_occupancy_percent': parking,
                'emergency_status': 'Normal',
                'staff_security': staff_security,
                'staff_food': staff_food,
                'staff_medical': staff_medical,
                'vip_early_entry': vip_early,
                'risk_level': risk,
                'predicted_risk_next_15min': predicted_risk,
                'bottleneck_prediction': bottleneck,
                'recommended_action': action
            }
            
            data.append(row)
            time_counter += 1
    
    return data

# Generate data for multiple events to reach 500 rows
all_data = []
event_count = 1

while len(all_data) < 500:
    event_data = generate_event_data(event_count)
    all_data.extend(event_data)
    event_count += 1
    
    if len(all_data) >= 500:
        all_data = all_data[:500]  # Trim to exactly 500 rows
        break

# Create DataFrame and save
df = pd.DataFrame(all_data)
df.to_csv('./dataset/training_data_500.csv', index=False)
print(f"Generated {len(df)} rows of training data across {event_count-1} events")
print(f"Events generated: E001 to E{event_count-1:03d}")