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
    const w = img.width;
    const h = img.height;

    if (!w || !h) {
        console.error("Image dimensions invalid", w, h);
        return;
    }

    // Define the map bounds based on image dimensions
    const southWest = [0, 0];
    const northEast = [h, w];
    const bounds = [southWest, northEast];

    // Add the image overlay
    L.imageOverlay(imageUrl, bounds).addTo(map);

    // --- LOGIC TO "COVER" / FILL THE SCREEN ---
    const mapSize = map.getSize();

    // Scale ratios
    const scaleX = mapSize.x / w;
    const scaleY = mapSize.y / h;

    // Cover scale is the LARGER ratio to ensure filling the screen
    const coverScale = Math.max(scaleX, scaleY);
    const coverZoom = Math.log2(coverScale);

    console.log("Image Loaded:", w, "x", h);
    console.log("Calculated Cover Zoom:", coverZoom);

    // CRITICAL FIX: Set view FIRST, then set minZoom.
    // If we set minZoom(X) when current zoom is < X, it might break.
    // Setting view forces the map to jump to the correct spot.
    map.setView([h / 2, w / 2], coverZoom);

    // Now lock the zoom out limit
    map.setMinZoom(coverZoom);

    // Lock bounds after a slight delay to allow rendering to stabilize
    // This prevents the "Black Screen" if the map thinks it's out of bounds initially
    setTimeout(() => {
        map.setMaxBoundsViscosity(1.0);
        map.setMaxBounds(bounds);
    }, 100);
};

// Add custom zoom controls if needed, or rely on pinch-zoom
// We can add a simple scale control for fun
// L.control.scale().addTo(map);

console.log("Map initialized in simulation mode.");
