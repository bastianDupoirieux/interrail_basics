// Initialize the map
const map = L.map('map').setView([48.8566, 2.3522], 12);
L.tileLayer('https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
}).addTo(map);

// Layer for markers
const markersLayer = new L.LayerGroup().addTo(map);

// Define custom icons for different amenities
const fountainIcon = L.divIcon({
    html: '<div style="background-color: #4A90E2; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="color: white; font-size: 16px;">💧</span></div>',
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
});

const toiletIcon = L.divIcon({
    html: '<div style="background-color: #4A90E2; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><span style="color: white; font-size: 16px;">🚻</span></div>',
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
});

// Alternative: Use Font Awesome icons (requires Font Awesome CSS)
// const fountainIcon = L.divIcon({
//     html: '<div style="background-color: #4A90E2; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fas fa-tint" style="color: white; font-size: 14px;"></i></div>',
//     className: 'custom-div-icon',
//     iconSize: [30, 30],
//     iconAnchor: [15, 15],
//     popupAnchor: [0, -15]
// });

// const toiletIcon = L.divIcon({
//     html: '<div style="background-color: #50C878; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><i class="fas fa-restroom" style="color: white; font-size: 14px;"></i></div>',
//     className: 'custom-div-icon',
//     iconSize: [30, 30],
//     iconAnchor: [15, 15],
//     popupAnchor: [0, -15]
// });

// Status message function
function showStatus(message, type = 'success') {
    const statusEl = document.getElementById('status-message');
    statusEl.textContent = message;
    statusEl.className = `status-message status-${type}`;
    statusEl.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        statusEl.style.display = 'none';
    }, 3000);
}

// Get selected amenities from checkboxes
function getSelectedAmenities() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Search in visible area button logic
const searchButton = document.getElementById('search-visible');
searchButton.onclick = function() {
    const selectedAmenities = getSelectedAmenities();
    
    if (selectedAmenities.length === 0) {
        showStatus('Please select at least one amenity type.', 'error');
        return;
    }
    
    // Show loading state
    searchButton.textContent = '🔍 Searching...';
    searchButton.disabled = true;
    document.body.classList.add('loading');
    
    // Get the current map bounds
    const bounds = map.getBounds();
    const bbox = [
        bounds.getSouth(),
        bounds.getWest(),
        bounds.getNorth(),
        bounds.getEast()
    ];

    // Send the bbox and amenities to the backend
    fetch('/query', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({bbox: bbox, amenities: selectedAmenities})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Clear previous markers
        markersLayer.clearLayers();
        
        // Add new markers
        data.forEach(item => {
            // Set popup text based on amenity type and name
            let popupText = "";
            let markerIcon = fountainIcon; // default icon
            
            if (item.tags && item.tags.amenity === 'drinking_water') {
                popupText = "💧 Water Fountain";
                markerIcon = fountainIcon; // light blue
            } else if (item.tags && item.tags.amenity === "toilets") {
                popupText = "🚻 Toilet";
                markerIcon = toiletIcon; // green
            } else {
                popupText = "📍 Amenity";
                markerIcon = fountainIcon; // default
            }
            
            if (item.tags && item.tags.name) {
                popupText += `<br><i>${item.tags.name}</i>`;
            }

            L.marker([item.lat, item.lon], {icon: markerIcon})
                .bindPopup(popupText)
                .addTo(markersLayer);
        });
        
        showStatus(`Found ${data.length} amenities in the visible area.`);
    })
    .catch(error => {
        console.error('Error:', error);
        showStatus('Error fetching data. Please try again.', 'error');
    })
    .finally(() => {
        // Reset button state
        searchButton.textContent = '🔍 Search in visible area';
        searchButton.disabled = false;
        document.body.classList.remove('loading');
    });
};

// Locate me button logic
document.getElementById('locate-me').onclick = function() {
    if (navigator.geolocation) {
        const locateButton = document.getElementById('locate-me');
        locateButton.textContent = '📍 Locating...';
        locateButton.disabled = true;
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                console.log('Location:', lat, lon);

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
                    .bindPopup('📍 You are here!')
                    .openPopup();
                
                showStatus('Location found!');
                
                // Reset button state
                const locateButton = document.getElementById('locate-me');
                locateButton.textContent = '📍 Center on My Location';
                locateButton.disabled = false;
            },
            function(error) {
                console.error('Geolocation error:', error);
                let errorMessage = 'Unable to retrieve your location.';
                if (error.code === 1) {
                    errorMessage = 'Location access denied. Please allow location access.';
                } else if (error.code === 2) {
                    errorMessage = 'Location unavailable. Please try again.';
                } else if (error.code === 3) {
                    errorMessage = 'Location request timed out. Please try again.';
                }
                showStatus(errorMessage, 'error');
                
                // Reset button state on error
                const locateButton = document.getElementById('locate-me');
                locateButton.textContent = '📍 Center on My Location';
                locateButton.disabled = false;
            }
        );
        
        // Reset button state after a timeout (in case geolocation hangs)
        setTimeout(() => {
            const locateButton = document.getElementById('locate-me');
            if (locateButton.textContent === '📍 Locating...') {
                locateButton.textContent = '📍 Center on My Location';
                locateButton.disabled = false;
            }
        }, 10000); // 10 second timeout
    } else {
        showStatus('Geolocation is not supported by your browser.', 'error');
    }
};

// Clear markers button
const clearButton = document.getElementById('clear-map');
clearButton.onclick = function() {
    markersLayer.clearLayers();
    showStatus('Map cleared.');
};

// Mobile-friendly map interactions
map.doubleClickZoom.disable(); // Disable double-tap zoom on mobile

// Close popups when clicking elsewhere on mobile
map.on('click', function() {
    map.closePopup();
});

// Auto-zoom to user location on first load (mobile-friendly)
if (navigator.geolocation && window.innerWidth <= 768) {
    navigator.geolocation.getCurrentPosition(
        function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            map.setView([lat, lon], 13);
            showStatus('Map centered on your location.');
        },
        function(error) {
            // Silently fail on auto-location, user can use the button
            console.log('Auto-location failed:', error);
        }
    );
}
