// Map Configuration
const imageUrl = 'https://res.cloudinary.com/dkkeujoix/image/upload/v1768404876/map_yxv8zw.png';
const mapContainer = 'map';

// Initialize Map with very loose constraints initially to prevent "lock out"
const map = L.map(mapContainer, {
    crs: L.CRS.Simple,
    minZoom: -10, // Extremely permissive start
    maxZoom: 5,
    zoomSnap: 0.1,
    zoomDelta: 0.1,
    attributionControl: false,
    zoomControl: false,
    maxBoundsViscosity: 0 // No strict bounce yet
});

const img = new Image();
img.src = imageUrl;

img.onload = function () {
    // 1. Get accurate dimensions
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    // 2. Define Bounds (Y-first for Lat, X-second for Lng)
    const southWest = [0, 0];
    const northEast = [h, w];
    const imageBounds = L.latLngBounds(southWest, northEast);

    // 3. Add Image
    L.imageOverlay(imageUrl, imageBounds).addTo(map);

    // 4. THE MAGIC FIX: Wait for layout to settle completely
    // We use a double-raf or timeout to ensure CSS rendering is done
    setTimeout(() => {
        // Force Leaflet to re-read the container size (fixes the "Black Bar" / "Corner" bug)
        map.invalidateSize();

        const mapSize = map.getSize();

        // Calculate scaling
        const scaleX = mapSize.x / w;
        const scaleY = mapSize.y / h;

        // Calculate the zoom level that COVERS the screen
        const coverZoom = Math.log2(Math.max(scaleX, scaleY));

        // Boost it for that "70%" feeling requested
        const startZoom = coverZoom + 0.4; // +0.4 is a nice cosmetic boost

        console.log("Fix Applied. Map:", mapSize.x, "x", mapSize.y, "CoverZoom:", coverZoom);

        // 5. Set Center & Zoom instantly
        // Center of image is [h/2, w/2]
        map.setView([h / 2, w / 2], startZoom, { animate: false });

        // 6. Lock it down (Delay slightly so the view setting happens first without fighting bounds)
        setTimeout(() => {
            // Set limits so user can't see black areas
            map.setMinZoom(coverZoom);

            // "Solid" walls
            map.setMaxBoundsViscosity(1.0);
            map.setMaxBounds(imageBounds);

            console.log("Map Locked and Loaded.");
        }, 100);

    }, 300); // 300ms wait ensures the modal/phone frame animation has settled
};

// Handle window resize gracefully
window.addEventListener('resize', () => {
    map.invalidateSize();
});
