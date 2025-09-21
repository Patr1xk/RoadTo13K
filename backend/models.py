import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.settings import dynamodb
from boto3.dynamodb.conditions import Key

class CrowdSimulation:
    def __init__(self):
        self.table = dynamodb.Table('crowd_simulation')
    
    def create_event(self, event_data):
        return self.table.put_item(Item=event_data)
    
    def get_event(self, event_id):
        try:
            response = self.table.get_item(Key={'event_id': event_id})
            print(f"DynamoDB response: {response}")
            return response.get('Item')
        except Exception as e:
            print(f"Error getting event {event_id}: {e}")
            raise e
    
    def get_all_events(self):
        response = self.table.scan()
        return response.get('Items', [])
    
    def update_event(self, event_id, update_data):
        # Build update expression
        update_expr = "SET "
        expr_values = {}
        
        for key, value in update_data.items():
            update_expr += f"{key} = :{key}, "
            expr_values[f":{key}"] = value
        
        update_expr = update_expr.rstrip(", ")
        
        return self.table.update_item(
            Key={'event_id': event_id},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_values,
            ReturnValues="UPDATED_NEW"
        )
    
    def delete_event(self, event_id):
        return self.table.delete_item(Key={'event_id': event_id})