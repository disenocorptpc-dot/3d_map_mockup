// Map Configuration
const imageUrl = 'https://res.cloudinary.com/dkkeujoix/image/upload/v1768404876/map_yxv8zw.png';
const mapContainer = 'map';

// Initialize Map
// We use a simple CRS (Coordinate Reference System) which maps [0,0] to [height, width]
const map = L.map(mapContainer, {
    crs: L.CRS.Simple,
    minZoom: -5, // Allow zooming out much further to fit large images initially
    maxZoom: 2,
    zoomSnap: 0.1,
    zoomDelta: 0.1,
    attributionControl: false,
    zoomControl: false
});

// Load the image to get dimensions
const img = new Image();
img.src = imageUrl;

img.onerror = function () {
    console.error("Error loading image from Cloudinary");
    alert("Error loading map image. Please check your internet connection.");
};

img.onload = function () {
    // Robust dimensions check using natural dims if available
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    if (!w || !h) {
        console.error("Image dimensions invalid", w, h);
        return;
    }

    // Force map to update its container size perception (fix for black screen offset)
    map.invalidateSize();

    // Define the map bounds: [0,0] bottom-left to [h, w] top-right
    const southWest = [0, 0];
    const northEast = [h, w];
    const bounds = L.latLngBounds(southWest, northEast);

    // Add overlay
    L.imageOverlay(imageUrl, bounds).addTo(map);

    // --- ZOOM CALCULATIONS ---
    const mapSize = map.getSize();

    // Ratios to fit width and height
    const scaleX = mapSize.x / w;
    const scaleY = mapSize.y / h;

    // coverZoom: The minimum zoom needed to fill the screen (0% black bars)
    // We take the MAX of the scales to ensure we fill the LARGEST dimension
    const coverZoom = Math.log2(Math.max(scaleX, scaleY));

    // startZoom: User requested "70%" / slightly zoomed in start.
    // We add a boost factor (e.g., +0.5 zoom level) to start closer than "just fit".
    // Adjust this value to control initial zoom tightness.
    const zoomBoost = 0.5;
    const startZoom = coverZoom + zoomBoost;

    console.log("Dims:", w, h, "CoverZoom:", coverZoom, "StartZoom:", startZoom);

    // 1. Set View CENTERED on the image
    map.setView([h / 2, w / 2], startZoom);

    // 2. Lock constraints
    // minZoom = coverZoom. 
    // This makes it IMPOSSIBLE to zoom out past the "fill screen" point.
    map.setMinZoom(coverZoom);

    // 3. Solid Bounds
    // Prevent dragging outside the image area
    // Viscosity 1.0 means fully solid (no bouncing/showing black background)
    map.setMaxBoundsViscosity(1.0);
    map.setMaxBounds(bounds);
};

console.log("Map initialized in simulation mode.");
