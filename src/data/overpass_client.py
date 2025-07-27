import requests

def fetch_api_data(url, query):
    response = requests.get(url, params={"data": query})
    response.raise_for_status()
    return response.json()
    