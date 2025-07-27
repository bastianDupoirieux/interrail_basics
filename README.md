# Interrail Basics

A repository showing a map with public water fountains and public toilets using Overpass API and Folium.

## Project Structure

```
interrail_basics/
├── src/                    # Source code
│   ├── data/              # Data handling
│   │   ├── __init__.py
│   │   ├── overpass_client.py
│   │   └── data_processor.py
│   ├── visualization/      # Map visualization
│   │   ├── __init__.py
│   │   ├── map_creator.py
│   │   └── styles.py
│   └── main.py            # Main application entry point
├── data/                   # Data storage
│   ├── raw/               # Raw API responses
│   └── processed/         # Processed data
├── output/                 # Generated outputs
│   ├── maps/              # Generated HTML maps
│   └── reports/           # Any reports or logs
├── config/                 # Configuration files
│   └── settings.py
├── requirements.txt        # Python dependencies
├── .gitignore
└── README.md
```

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the application:
   ```bash
   python src/main.py
   ```

## Features

- Fetch data from Overpass API
- Process and clean data
- Create interactive maps with Folium
- Export maps as HTML files
