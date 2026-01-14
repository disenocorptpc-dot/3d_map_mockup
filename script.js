// Map Configuration
const imageUrl = 'https://res.cloudinary.com/dkkeujoix/image/upload/v1768404876/map_yxv8zw.png';
const mapContainer = 'map';

// Initialize Map
// We use a simple CRS (Coordinate Reference System) which maps [0,0] to [height, width]
const map = L.map(mapContainer, {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
    zoomSnap: 0.1,
    zoomDelta: 0.1,
    attributionControl: false,
    zoomControl: false // specific UI for mobile often hides default controls
});

// Load the image to get dimensions
const img = new Image();
img.src = imageUrl;

img.onload = function () {
    const w = img.width;
    const h = img.height;

    // Define the map bounds based on image dimensions
    // SouthWest, NorthEast
    const southWest = [0, 0];
    const northEast = [h, w];
    const bounds = [southWest, northEast];

    // Add the image overlay
    L.imageOverlay(imageUrl, bounds).addTo(map);

    // --- LOGIC TO "COVER" / FILL THE SCREEN ---

    // We need to calculate manually the zoom level that makes the image 
    // fill the container (like CSS object-fit: cover)
    const mapSize = map.getSize();

    // Calculate the scale ratios
    // mapSize.x is container width, w is image width
    const scaleX = mapSize.x / w;
    const scaleY = mapSize.y / h;

    // exactZoom takes the larger scale to ensure we cover the whole screen
    // L.CRS.Simple maps 1 unit to 1 px at zoom 0 (scale 1).
    // So scale = 2^zoom  =>  zoom = log2(scale)
    const coverScale = Math.max(scaleX, scaleY);
    const coverZoom = Math.log2(coverScale);

    // Set the view to center with the calculated "cover" zoom
    map.setView([h / 2, w / 2], coverZoom);

    // Restrict panning to the image area
    // We pad the bounds slightly to allow bouncing effect without seeing too much background
    map.setMaxBounds(bounds);
};

// Add custom zoom controls if needed, or rely on pinch-zoom
// We can add a simple scale control for fun
// L.control.scale().addTo(map);

console.log("Map initialized in simulation mode.");
