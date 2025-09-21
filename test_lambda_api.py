import requests

url = 'https://jzmnoru4sa.execute-api.us-east-1.amazonaws.com/test/run-demo'
headers = {'Content-Type': 'application/json'}
data = {'scenario_type': 'concert_entry_rush'}

response = requests.post(url, json=data, headers=headers)
print('Status:', response.status_code)
print('Body:', response.text)
