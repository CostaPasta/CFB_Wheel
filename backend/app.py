from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS

# Path to the JSON file
JSON_FILE_PATH = 'teams.json'

# Function to load teams from JSON
def load_teams():
    if os.path.exists(JSON_FILE_PATH):
        with open(JSON_FILE_PATH, 'r') as f:
            return json.load(f)
    return []

teams = load_teams()

# Function to save teams to JSON
def save_teams(teams):
    with open(JSON_FILE_PATH, 'w') as f:
        json.dump(teams, f, indent=4)

@app.route('/teams', methods=['GET'])
def get_teams():
    return jsonify(teams)

@app.route('/update_weight', methods=['POST'])
def update_weight():
    data = request.get_json()
    print(f"Received data: {data}")  # Debugging statement
    team_id = data.get('teamId')
    new_weight = data.get('newWeight')
    if team_id is None or new_weight is None:
        print("Invalid request payload:", data)  # Debugging statement
        return jsonify({'message': 'Invalid request payload'}), 400
    for team in teams:
        if team['id'] == team_id:
            print(f"Updating team ID {team_id} to weight {new_weight}")
            team['stars'] = new_weight
            save_teams(teams)
            return jsonify({'message': 'Weight updated successfully'})
    print(f"Team ID {team_id} not found")
    return jsonify({'message': 'Team not found'}), 404

@app.route('/spin', methods=['GET'])
def spin_wheel():
    weights = [team['stars'] for team in teams]
    max_weight = max(weights)
    inverse_weights = [max_weight + 1 - w for w in weights]
    selected_team = np.random.choice(teams, p=np.array(inverse_weights) / np.sum(inverse_weights))
    return jsonify({'team': selected_team})

if __name__ == '__main__':
    app.run(debug=True)
