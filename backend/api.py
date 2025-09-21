import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
from backend.models import CrowdSimulation
from backend.live_data_generator import generate_multiple_live_events, CrowdLiveEvents

app = FastAPI(title="Crowd Simulation API")
crowd_db = CrowdSimulation()
live_db = CrowdLiveEvents()

class EventCreate(BaseModel):
    event_id: str
    timestamp: str
    density_estimate: int
    expected_crowd_size: int
    gate_data: Dict[str, str]
    heatmap_data: Dict[str, int]
    recommendations: List[str]
    risk_level: str
    scenario_type: str
    status: str

class EventUpdate(BaseModel):
    timestamp: Optional[str] = None
    density_estimate: Optional[int] = None
    expected_crowd_size: Optional[int] = None
    gate_data: Optional[Dict[str, str]] = None
    heatmap_data: Optional[Dict[str, int]] = None
    recommendations: Optional[List[str]] = None
    risk_level: Optional[str] = None
    scenario_type: Optional[str] = None
    status: Optional[str] = None

class LiveEventCreate(BaseModel):
    event_id: str
    timestamp: str
    density_estimate: int
    expected_crowd_size: int
    gate_data: Dict[str, str]
    heatmap_data: Dict[str, int]
    scenario_type: str
    status: str

@app.get("/")
def root():
    return {"message": "Crowd Simulation API"}

@app.post("/events")
def create_event(event: EventCreate):
    try:
        crowd_db.create_event(event.dict())
        return {"message": "Event created successfully", "event_id": event.event_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/events/{event_id}")
def get_event(event_id: str):
    try:
        event = crowd_db.get_event(event_id)
        if not event:
            raise HTTPException(status_code=404, detail="Event not found")
        return event
    except Exception as e:
        if "ExpiredToken" in str(e):
            raise HTTPException(status_code=401, detail="AWS credentials expired")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/events")
def get_all_events():
    try:
        return crowd_db.get_all_events()
    except Exception as e:
        if "ExpiredToken" in str(e):
            raise HTTPException(status_code=401, detail="AWS credentials expired")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/events/{event_id}")
def update_event(event_id: str, event_update: EventUpdate):
    # Remove None values
    update_data = {k: v for k, v in event_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    try:
        crowd_db.update_event(event_id, update_data)
        return {"message": "Event updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/events/{event_id}")
def delete_event(event_id: str):
    try:
        crowd_db.delete_event(event_id)
        return {"message": "Event deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/events/generate-live")
def generate_live_events(count: int = 10):
    try:
        live_events = generate_multiple_live_events(count)
        
        # Insert into live events table
        with live_db.table.batch_writer() as batch:
            for event in live_events:
                batch.put_item(Item=event)
        
        return {
            "message": f"Generated {len(live_events)} live events",
            "count": len(live_events),
            "table": "crowd_live_events",
            "events": live_events
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/events/live")
def get_live_events():
    try:
        return live_db.get_all_events()
    except Exception as e:
        if "ExpiredToken" in str(e):
            raise HTTPException(status_code=401, detail="AWS credentials expired")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)