from flask import Flask, jsonify, request
import subprocess
import threading
import os

app = Flask(__name__)

# Path to your live_data_generator.py
SCRIPT_PATH = os.path.join(os.path.dirname(__file__), 'live_data_generator.py')

# To prevent multiple simulations running at once
simulation_thread = None

def run_simulation():
    subprocess.Popen(['python', SCRIPT_PATH, '--live'])

@app.route('/start-simulation', methods=['POST'])
def start_simulation():
    global simulation_thread
    if simulation_thread and simulation_thread.is_alive():
        return jsonify({'status': 'already running'}), 409
    simulation_thread = threading.Thread(target=run_simulation)
    simulation_thread.start()
    return jsonify({'status': 'started'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
