from flask import Flask, render_template, request, jsonify
from src.data.overpass_client import fetch_api_data
import yaml

with open('config.yml', 'r') as f:
    config = yaml.safe_load(f)

url = config['overpass_url']

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/query', methods=['POST'])
def query():
    data = request.json
    bbox = data['bbox']  # [south, west, north, east]
    amenity = data['amenity']  # e.g., 'drinking_water' or 'toilets'
    query = f"""
    [out:json][timeout:900];
    node[amenity={amenity}]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
    out geom;
    """
    overpass_data = fetch_api_data(url, query)
    # Extract lat/lon for each node
    features = [
        {
            'lat': el['lat'],
            'lon': el['lon'],
            'name': el['tags'].get('name', amenity)
        }
        for el in overpass_data.get('elements', [])
        if el['type'] == 'node'
    ]
    return jsonify(features)

if __name__ == '__main__':
    app.run(debug=True)