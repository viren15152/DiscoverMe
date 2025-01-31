let map;
let marker;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let directionsService;
let directionsRenderer;

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
        center: { lat: 51.5074, lng: -0.1278 }, // Default: London
        zoom: 12,
    });

    marker = new google.maps.Marker({
        map: map,
        draggable: true
    });

    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({ map });

    loadFavorites(); // ✅ Load favorites when initializing the map
}

// ✅ Search for a place and add to favorites
function searchLocation() {
    const searchBox = document.getElementById("searchBox").value;
    if (!searchBox) return alert("Please enter a place!");

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchBox }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK) {
            const location = results[0].geometry.location;
            map.setCenter(location);
            marker.setPosition(location);
            addFavorite(results[0].formatted_address, location);
        } else {
            alert("❌ Location not found. Please try a different place.");
        }
    });
}

// ✅ Get route directions between two places
function getDirections() {
    const start = document.getElementById("startLocation").value;
    const end = document.getElementById("destination").value;

    if (!start || !end) {
        alert("Please enter both start and destination locations.");
        return;
    }

    const request = {
        origin: start,
        destination: end,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            directionsRenderer.setPanel(document.getElementById("directionsPanel"));
        } else {
            alert("❌ Directions request failed: " + status);
        }
    });
}

// ✅ Fix: Ensure favorites are stored and loaded properly
function addFavorite(name, location) {
    if (!name || !location) return;

    const favorite = { name, lat: location.lat(), lng: location.lng() };

    // Prevent duplicate entries
    if (favorites.some(fav => fav.name === name)) {
        alert("❌ This place is already in your favorites!");
        return;
    }

    favorites.push(favorite);
    localStorage.setItem("favorites", JSON.stringify(favorites)); // Save to LocalStorage
    loadFavorites(); // ✅ Refresh the favorites list
}

function loadFavorites() {
    const list = document.getElementById("favoriteList");
    if (!list) {
        console.warn("⚠ favoriteList element not found in the DOM.");
        return;
    }
    
    list.innerHTML = "";
    favorites.forEach((fav, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${fav.name}</span>
            <button class="btn-remove" onclick="removeFavorite(${index})">Remove</button>
        `;
        li.onclick = () => map.setCenter({ lat: fav.lat, lng: fav.lng }); //Clicking recenters the map
        list.appendChild(li);
    });
}

function removeFavorite(index) {
    favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites)); //Update storage
    loadFavorites(); //Refresh the list
}

// ✅ Ensure Google Maps API & Favorites are fully loaded before running functions
window.onload = function() {
    loadGoogleMaps();
    loadFavorites();  //Load saved favorites from LocalStorage
};



