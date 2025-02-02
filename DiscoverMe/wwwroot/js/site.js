let map;
let marker;
let directionsService;
let directionsRenderer;
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
        script.onload = () => console.log("✅ Google Maps script loaded.");
        script.onerror = () => console.error("❌ Failed to load Google Maps script!");

        document.head.appendChild(script);
    } catch (error) {
        console.error("⚠ Error loading Google Maps:", error);
        alert("⚠ Failed to load Google Maps. Check console for details.");
    }
}

function initMap() {
    console.log("🗺 Initializing Google Maps...");

    if (typeof google === "undefined") {
        console.error("❌ Google Maps is not available!");
        return;
    }

    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
    });

    marker = new google.maps.Marker({
        map: map,
        draggable: true
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        preserveViewport: false, // Ensures full route is visible
        suppressMarkers: false  // Keeps markers visible
    });

    directionsRenderer.setMap(map);
    directionsRenderer.setPanel(document.getElementById("directionsPanel"));

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

function searchLocation() {
    const searchBox = document.getElementById("searchBox").value;
    if (!searchBox) return alert("Please enter a place!");

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchBox }, (results, status) => {
        if (status === "OK") {
            const location = results[0].geometry.location;
            map.setCenter(location);
            marker.setPosition(location);
            addFavorite(results[0].formatted_address, location);
        } else {
            alert("❌ Location not found!");
        }
    });
}

function addFavorite(name, location) {
    const favorite = { name, lat: location.lat(), lng: location.lng() };
    favorites.push(favorite);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
}

function loadFavorites() {
    const list = document.getElementById("favoriteList");
    list.innerHTML = "";
    favorites.forEach((fav, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${fav.name}</span>
            <button class="btn-remove" onclick="removeFavorite(${index})">Remove</button>`;
        li.onclick = () => map.setCenter({ lat: fav.lat, lng: fav.lng });
        list.appendChild(li);
    });
}

function removeFavorite(index) {
    favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
}

// ✅ FIX: Ensure ALL STEPS from the start of the route are displayed
function getDirections() {
    const startLocation = document.getElementById("startLocation").value;
    const destination = document.getElementById("destination").value;

    if (!startLocation || !destination) {
        alert("⚠ Please enter both start and destination locations!");
        return;
    }

    const request = {
        origin: startLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        provideRouteAlternatives: true, // Allows multiple routes if available
        unitSystem: google.maps.UnitSystem.METRIC,
    };

    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);

            // 🚀 Extract all steps from the entire route
            let steps = [];
            result.routes[0].legs.forEach((leg) => {
                leg.steps.forEach((step) => {
                    steps.push(step.instructions);
                });
            });

            // Call loadDirections() to update UI
            loadDirections(steps);

            console.log("✅ Directions found:", result);
        } else {
            alert("❌ Unable to find directions. Check your input.");
            console.error("❌ Directions API error:", status);
        }
    });
}

// FIX: Ensure directions panel starts from Step 1 and is properly formatted
function loadDirections(directions) {
    const directionsPanel = document.getElementById("directionsPanel");

    // Reset panel content before adding new directions
    directionsPanel.innerHTML = "";

    // Add all directions steps from the beginning
    directions.forEach((step, index) => {
        const div = document.createElement("div");
        div.innerHTML = `<strong>${index + 1}.</strong> ${step}`;
        directionsPanel.appendChild(div);
    });

    // 🚀 Scroll to the top to ensure all steps are visible
    directionsPanel.scrollTop = 0;
}

// Load the map when the window loads
window.onload = loadGoogleMaps;


