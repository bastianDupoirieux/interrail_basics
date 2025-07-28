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
    print("data", data)
    bbox = data['bbox']
    amenities = data['amenities']  # Now a list
    
    # Collect all features from all amenities
    all_features = []
    
    for amenity in amenities:
        query = f"""
        [out:json][timeout:900];
        node[amenity={amenity}]({bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]});
        out geom;
        """
        
        print("query", query)
        try:
            overpass_data = fetch_api_data(url, query)
            
            # Extract lat/lon for each node
            features = [
                {
                    'lat': el['lat'],
                    'lon': el['lon'],
                    'tags': el.get('tags', {}),  # Include all tags for frontend
                    'name': el.get('tags', {}).get('name', amenity)
                }
                for el in overpass_data.get('elements', [])
                if el['type'] == 'node'
            ]
            
            # Add features from this amenity to the total
            all_features.extend(features)
            
        except Exception as e:
            print(f"Error querying {amenity}: {e}")
            # Continue with other amenities even if one fails
    
    return jsonify(all_features)

if __name__ == '__main__':
    app.run(debug=True)