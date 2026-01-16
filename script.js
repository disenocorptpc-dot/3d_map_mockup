// Map Configuration - Cloudinary WebP Images
const views = {
    front: {
        url: 'https://res.cloudinary.com/dkkeujoix/image/upload/v1768581646/FrontFiltro-convertido-de-png_r8dofd.webp',
        title: 'Vista Frontal',
        focus: [1640, 4660]
    },
    perspective: {
        url: 'https://res.cloudinary.com/dkkeujoix/image/upload/v1768581564/PerspectivaFinal-convertido-de-png_ifkfzl.webp',
        title: 'Perspectiva',
        focus: [912, 5663]
    }
};

let currentViewId = 'front';
let currentOverlay = null;

// Initialize Map
// We use a simple CRS (Coordinate Reference System) for flat images
const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -5, // Allow zooming out initially to see where we are
    maxZoom: 2,  // Large high-res images usually don't need huge zoom numbers in standard Leaflet scale
    zoomSnap: 0.1,
    zoomDelta: 0.1,
    attributionControl: false,
    zoomControl: false,
    bounceAtZoomLimits: false, // Prevents rubber-banding
    maxBoundsViscosity: 1.0    // Solid edges
});

// Function to calculate the zoom level needed to cover the screen
function getCoverZoom(imgWidth, imgHeight, mapWidth, mapHeight) {
    const scaleX = mapWidth / imgWidth;
    const scaleY = mapHeight / imgHeight;
    // To cover (like object-fit: cover), we need the larger of the two scales
    return Math.max(scaleX, scaleY); // Math.log2() if we were talking strictly zoom levels, but usage varies.
    // In Leaflet CRS.Simple, zoom 0 means 1 pixel = 1 map unit? 
    // Usually: zoom = Math.log2(scale).
}

function loadView(viewId) {
    const view = views[viewId];
    console.log(`Loading view: ${viewId}`);

    // Create a temporary image to get dimensions
    const img = new Image();
    img.src = view.url;

    img.onload = function () {
        const w = this.width;
        const h = this.height;
        console.log(`Image loaded: ${w}x${h}`);

        // Define bounds for the image: [[0,0], [Height, Width]] for CRS.Simple
        // Leaflet Y is often inverted or just top-down. 
        // Standard L.imageOverlay bounds: [[south, west], [north, east]]
        const bounds = [[0, 0], [h, w]];

        // Remove previous layer
        if (currentOverlay) {
            map.removeLayer(currentOverlay);
        }

        // Add new Overlay
        currentOverlay = L.imageOverlay(view.url, bounds).addTo(map);

        // Configure Map Limits
        map.setMaxBounds(bounds);

        // Calculate "Cover" Zoom
        // Logic: specific to preventing black bars
        // We want the minimum zoom to be such that the image COVERS the viewport.

        function updateZoomLogic() {
            const mapSize = map.getSize(); // Pixels
            // CRS.Simple: At zoom 0, 1 lat/lng unit = 1 pixel.
            // Image is w x h units.

            // To fit width: zoom factor = mapSize.x / w
            // To fit height: zoom factor = mapSize.y / h
            // Zoom Level = Math.log2(factor)

            const zoomX = Math.log2(mapSize.x / w);
            const zoomY = Math.log2(mapSize.y / h);

            // "Cover" means we take the larger zoom (zoomed out less, or zoomed in more?)
            // We want to FILL the screen, so we need the larger scale.
            const coverZoom = Math.max(zoomX, zoomY);

            // Set MinZoom so user can't zoom out to black bars
            map.setMinZoom(coverZoom);

            // "70% Zoom" Calculation:
            // Define the range between "Cover" (0%) and "Max Detail" (100% / zoom level 2)
            // But since maxZoom is arbitrary (2), let's say 100% is where image is native scale (zoom 0 approx?).
            // Let's rely on standard logic: coverZoom + (0.7 * (map.getMaxZoom() - coverZoom))?
            // MaxZoom is 2. CoverZoom might be -2. Range = 4. 70% of 4 = 2.8. Start = -2 + 2.8 = 0.8.
            // This is a good heuristic.

            // Safety cap: ensure we don't zoom in TOO close if the difference is huge.
            const targetZoom = coverZoom + ((map.getMaxZoom() - coverZoom) * 0.7);

            // Determinar punto de inicio (Custom o Centro)
            let startCenter = [h / 2, w / 2];
            if (view.focus) {
                startCenter = view.focus;
            }

            map.setView(startCenter, targetZoom);
        }

        // Delay slightly ensuring container is sized
        setTimeout(() => {
            map.invalidateSize();
            updateZoomLogic();
        }, 100);
    };

    img.onerror = function () {
        console.error("Error loading image from Cloudinary");
        alert("Error loading the high-res map. Please check connection.");
    };
}

// Initial Load
loadView(currentViewId);

// View Switcher Logic
const toggleBtn = document.getElementById('viewToggle');
const toggleText = toggleBtn.querySelector('.text');

toggleBtn.addEventListener('click', () => {
    // Switch ID
    currentViewId = currentViewId === 'front' ? 'perspective' : 'front';

    // Update Text (Show what NEXT click will do? Or current?)
    // Usually buttons show what they DO. "Switch to Perspective".
    // Or just "Change View" generic.
    // Let's keep generic for now to keep it simple, or toggle text.

    loadView(currentViewId);
});

// Handle window resize
window.addEventListener('resize', () => {
    map.invalidateSize();
    // Re-run zoom logic? Ideally yes, but map handles simple resizing okay.
});
