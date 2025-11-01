// frontend/script.js

const map = L.map("map").setView([19.07, 72.87], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap contributors",
}).addTo(map);


let routeLayers = [];

// Fetch safe routes from backend
async function fetchRoutes(source, destination) {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/routes?source=${encodeURIComponent(
        source
      )}&destination=${encodeURIComponent(destination)}`
    );
    const data = await response.json();
    if (!data.routes) {
      alert("No routes found.");
      return;
    }

    // Clear old layers and route info
    routeLayers.forEach((layer) => map.removeLayer(layer));
    routeLayers = [];
    document.getElementById("routes").innerHTML = "";

    // Plot all routes on map
    data.routes.forEach((route, idx) => {
      const latlngs = route.coords.map((coord) => [coord[0], coord[1]]);

      const color = idx === 0 ? "green" : idx === 1 ? "orange" : "red";
      const polyline = L.polyline(latlngs, {
        color: color,
        weight: 5,
        opacity: 0.8,
      }).addTo(map);

      routeLayers.push(polyline);

      const info = document.createElement("div");
      info.className = "route-info";
      info.innerHTML = `
        <h3>Route ${route.route_id}</h3>
        <p><b>Distance:</b> ${route.distance_km} km</p>
        <p><b>Duration:</b> ${route.duration_min} min</p>
        <p><b>Safety Score(From 0 to 1):</b> ${route.safety_score}</p>
      `;
      document.getElementById("routes").appendChild(info);

      // Adjust map view to show the route
      if (idx === 0) map.fitBounds(polyline.getBounds());
    });
  } catch (error) {
    console.error("Error fetching routes:", error);
    alert("Something went wrong while fetching routes.");
  }
}

// Handle button click
document.getElementById("findRoute").addEventListener("click", () => {
  const source = document.getElementById("source").value.trim();
  const destination = document.getElementById("destination").value.trim();
  if (!source || !destination) {
    alert("Please enter both source and destination.");
    return;
  }
  fetchRoutes(source, destination);
});
