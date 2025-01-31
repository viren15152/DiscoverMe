﻿let map;
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
        center: { lat: 51.5074, lng: -0.1278 },
        zoom: 12,
    });

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
        li.innerHTML = `
            <span>${fav.name}</span>
            <button class="btn-remove" onclick="removeFavorite(${index})">Remove</button>
        `;
        li.onclick = () => map.setCenter({ lat: fav.lat, lng: fav.lng });
        list.appendChild(li);
    });
}

function removeFavorite(index) {
    favorites.splice(index, 1);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
}

window.onload = loadGoogleMaps;
