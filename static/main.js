// Initialize the map
const map = L.map('map').setView([48.8566, 2.3522], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// Layer for markers
const markersLayer = new L.LayerGroup().addTo(map);

// Search in visible area button logic
const searchButton = document.getElementById('search-visible');
searchButton.onclick = function() {
    // Get the current map bounds
    const bounds = map.getBounds();
    const bbox = [
        bounds.getSouth(),
        bounds.getWest(),
        bounds.getNorth(),
        bounds.getEast()
    ];
    // Get the selected amenity
    const amenity = document.getElementById('amenity').value;

    // Send the bbox and amenity to the backend
    fetch('/query', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({bbox: bbox, amenity: amenity})
    })
    .then(response => response.json())
    .then(data => {
        // Clear previous markers
        markersLayer.clearLayers();
        // Add new markers
        data.forEach(item => {
            L.marker([item.lat, item.lon])
                .bindPopup(item.name)
                .addTo(markersLayer);
        });
    });
};

document.getElementById('locate-me').onclick = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                console.log(lat, lon);
                map.setView([lat, lon], 15); // 15 is a good zoom for city-level
                // Optionally, add a marker for the user's location:
                L.marker([lat, lon]).addTo(map)
                    .bindPopup('You are here!')
                    .openPopup();
            },
            function(error) {
                alert('Unable to retrieve your location.');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
};

// Optional: Clear markers button
const clearButton = document.getElementById('clear-map');
clearButton.onclick = function() {
    markersLayer.clearLayers();
};
