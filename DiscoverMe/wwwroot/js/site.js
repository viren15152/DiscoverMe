// Initialize Google Maps
let map;
let directionsService;
let directionsRenderer;
let marker;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

async function loadGoogleMaps() {
    try {
        console.log("🚀 Fetching Google Maps API key...");
        const response = await fetch('/api/google-maps-key');

        if (!response.ok) {
            throw new Error("❌ Failed to fetch API key from backend.");
        }

        const data = await response.json();
        const apiKey = data.apiKey;

        if (!apiKey) {
            console.error("❌ Google Maps API key is missing!");
            return;
        }

        console.log("✅ API Key Retrieved:", apiKey);

        // Load Google Maps script dynamically
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onerror = () => console.error("❌ Failed to load Google Maps script!");
        document.head.appendChild(script);
    } catch (error) {
        console.error("⚠ Error loading Google Maps:", error);
        alert("⚠ Failed to load Google Maps. Check console for details.");
    }
}

function initMap() {
    console.log("🗺 Initializing Google Maps...");

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    marker = new google.maps.Marker({
        map: map,
        draggable: true
    });

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                marker.setPosition(userLocation);
                map.setCenter(userLocation);
            },
            (error) => {
                console.warn("⚠ Geolocation error:", error.message);
                alert("⚠ Location access denied.");
            }
        );
    }

    loadFavorites();
}

// Load the map when the window loads
window.onload = loadGoogleMaps;

// Fetch directions and display from the correct start point
function getDirections() {
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
    
    if (!origin || !destination) {
        alert("Please enter both origin and destination.");
        return;
    }
    
    const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: false,
    };

    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            loadDirections(result.routes[0].legs[0]);
        } else {
            alert("Failed to load directions: " + status);
        }
    });
}

// Populate directions correctly in the UI
function loadDirections(leg) {
    const directionsPanel = document.getElementById("directionsPanel");
    directionsPanel.innerHTML = "";
    
    // Ensure the first step (starting point) is included
    const startDiv = document.createElement("div");
    startDiv.innerHTML = `<strong>1.</strong> Depart from ${leg.start_address}`;
    startDiv.style.padding = "10px";
    startDiv.style.borderBottom = "1px solid #ccc";
    directionsPanel.appendChild(startDiv);
    
    leg.steps.forEach((step, index) => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${index + 2}.</strong> ${step.instructions}`;
        div.style.padding = "10px";
        div.style.borderBottom = "1px solid #ccc";
        directionsPanel.appendChild(div);
    });
    
    // Ensure last step (destination arrival) is included
    const endDiv = document.createElement("div");
    endDiv.innerHTML = `<strong>${leg.steps.length + 2}.</strong> Arrive at ${leg.end_address}`;
    endDiv.style.padding = "10px";
    endDiv.style.borderBottom = "1px solid #ccc";
    directionsPanel.appendChild(endDiv);
    
    // Ensure panel scrolls fully to show all directions
    directionsPanel.style.maxHeight = "500px";
    directionsPanel.style.overflowY = "auto";
} 

// Ensure buttons are spaced correctly
document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("searchButton");
    const directionsButton = document.getElementById("getDirectionsButton");
    
    searchButton.style.marginLeft = "10px";
    directionsButton.style.marginLeft = "10px";
});






