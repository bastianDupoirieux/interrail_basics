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
            // Set popup text based on amenity type and name
            let popupText = "";
            console.log(item)
            if (item.name === 'drinking_water') {
                popupText = "Water Fountain";
            } else if (item.name === "toilets") {
                popupText = "Toilet";
            } else {
                popupText = "Amenity";
            }
            if (item.tags && item.tags.name) {
                popupText += `<br><i>${item.tags.name}</i>`;
            }

            L.marker([item.lat, item.lon])
                .bindPopup(popupText)
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

                // Define a custom icon for the user's location
                const userLocationIcon = L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                map.setView([lat, lon], 15);
                L.marker([lat, lon], {icon: userLocationIcon}).addTo(map)
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
