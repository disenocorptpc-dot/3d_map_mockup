// Map Configuration - Local Tiles
const views = {
    front: {
        url: 'tiles/front/{z}/{x}/{y}.png',
        maxZoom: 6, // From tiler script output
        dims: [6480, 11520] // Height, Width (Lat, Lng) - Wait, source was 11520x6480 (WxH)?
        // Script output: Source dimensions: 11520x6480.
        // Leaflet CRS.Simple: [0,0] to [Height, Width] usually?
        // Let's verify Orientation. Standard Image: Width=X, Height=Y.
        // Leaflet: Lat=Y, Lng=X.
        // So bounds are [0,0] to [Height, Width].
        // Bounds = [[0,0], [6480, 11520]]
    },
    perspective: {
        url: 'tiles/perspective/{z}/{x}/{y}.png',
        maxZoom: 6, // Assume same for now, script will confirm
        dims: [6480, 11520] // Placeholder, update if different
    }
};

let currentView = 'front';
const mapContainer = 'map';

// Initialize Map
const map = L.map(mapContainer, {
    crs: L.CRS.Simple,
    minZoom: 0, // Tiles usually start at 0
    maxZoom: 6,
    zoomSnap: 0.1,
    zoomDelta: 0.1,
    attributionControl: false,
    zoomControl: false,
    bounceAtZoomLimits: false,
    maxBoundsViscosity: 1.0
});

let tileLayer = null;

function loadView(viewName) {
    const view = views[viewName];

    // Remove old layer
    if (tileLayer) {
        map.removeLayer(tileLayer);
    }

    // 1. Define Bounds for this image
    // Note: Script logic: "Source dimensions: 11520x6480" (WxH)
    // Leaflet Bounds: southWest, northEast.
    // southWest = [0,0]
    // northEast = [Height, Width] = [6480, 11520]
    // Wait, check tiler script logic again. 
    // It generates standard tiles. Leaflet defaults to 256px tiles.
    // L.CRS.Simple 1 unit = 1 pixel? 
    // Start with strict L.tileLayer.

    // For tiled images in Leaflet with CRS.Simple, we usually use L.tileLayer 
    // and we need to map the "world" correctly.
    // Default L.CRS.Simple: 1 px = 1 map unit? No, depends on transformation.
    // The safest way for "Big Image" is using a plugin like `Leaflet.Zoomify` or just configuring `tms: true` if needed.
    // My script output: standard XYZ (top-left origin).
    // Leaflet tileLayer default: top-left origin.
    // So tiles should match.

    // But we need to tell Leaflet how big the world is so it knows when to stop panning?
    // And coordinate mapping:
    // With L.CRS.Simple, projection is identity.
    // So Lat 0 = Y 0. Lat 100 = Y 100.
    // Lng 0 = X 0. Lng 100 = X 100.

    // Image 11520x6480.
    // Bounds: [[-6480, 0], [0, 11520]]? Leaflet Y goes up?
    // L.CRS.Simple: "A simple CRS that maps longitude and latitude into x and y directly."
    // "y" usually points UP in Cartesian?
    // In standard Leaflet (Web Mercator), Y points up (Latitude).
    // In L.CRS.Simple, it's just a grid.

    // Let's assume standard image texturing: [0,0] is top-left.
    // We need to map [0, -Height] to [Width, 0] or similar?
    // Actually, let's look at `L.tileLayer` standard behavior for simple images.
    // Often used: `L.tileLayer(url, { tms: false, noWrap: true })`.
    // Coordinates: map.project([lat, lng], zoom).

    // SIMPLIFICATION:
    // If we get it wrong, the map is upside down or displaced.
    // For 120MB image, tiles are mandatory.

    tileLayer = L.tileLayer(view.url, {
        minZoom: 0,
        maxZoom: view.maxZoom,
        noWrap: true,
        bounds: [[-view.dims[0], 0], [0, view.dims[1]]] // Try negative Y for "top-left" memory
    }).addTo(map);

    // Fit bounds initially
    // If we use negative Y for height (common in graphics vs generic cartesian)
    const h = view.dims[0]; // 6480
    const w = view.dims[1]; // 11520
    const bounds = [[-h, 0], [0, w]];

    map.setMaxBounds(bounds);
    map.fitBounds(bounds);

    // Zoom logic similar to before but adapted for tiles
    // Tiles 0 is whole world in 256px?
    // My script calculated max_zoom=6 for 1:1.
    // Zoom 0 = 180x101 px (tiny).

    // So "Fill Screen" zoom will be around 2 or 3?
    // Let's rely on fitBounds + slight zoom in.

    setTimeout(() => {
        map.fitBounds(bounds);
        const z = map.getZoom();
        map.setZoom(z + 0.5); // Boost
    }, 100);
}

// Initial Load
// We need to fetch dimensions or hardcode them?
// The script outputs dimensions. 
// Front: 11520x6480.
// Perspective: Let's assume similar or checking.
loadView('front');

// Toggle Handler
document.getElementById('viewToggle').addEventListener('click', () => {
    currentView = currentView === 'front' ? 'perspective' : 'front';
    loadView(currentView);
});

// Update dims for Perspective if needed (Checking later)
views.perspective.dims = [6480, 11520]; // Assuming same layout for now
