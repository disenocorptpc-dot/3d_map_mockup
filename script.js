// Map Configuration
const imageUrl = 'https://res.cloudinary.com/dkkeujoix/image/upload/v1768404876/map_yxv8zw.png';
const mapContainer = 'map';

// Initialize Map with strict settings
// bounceAtZoomLimits: false -> Prevents the map from bouncing when you pinch-zoom out too much
const map = L.map(mapContainer, {
    crs: L.CRS.Simple,
    minZoom: -10,
    maxZoom: 5,
    zoomSnap: 0.05, // Smoother zoom steps
    zoomDelta: 0.1,
    attributionControl: false,
    zoomControl: false,
    bounceAtZoomLimits: false, // Critical for "no bounce" feeling
    maxBoundsViscosity: 1.0    // Critical for hard edges
});

const img = new Image();
img.src = imageUrl;

img.onload = function () {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    // 1. Define bounds purely on image dimensions
    const southWest = [0, 0];
    const northEast = [h, w];
    const imageBounds = L.latLngBounds(southWest, northEast);

    // 2. Add Image
    L.imageOverlay(imageUrl, imageBounds).addTo(map);

    // 3. Setup Layout immediately
    function configureMapLayout() {
        map.invalidateSize();

        const mapSize = map.getSize();

        // Calculate the zoom level needed to COVER the viewport
        const scaleX = mapSize.x / w;
        const scaleY = mapSize.y / h;
        const coverZoom = Math.log2(Math.max(scaleX, scaleY));

        // Initial "Boost" (70% feel)
        const startZoom = coverZoom + 0.5;

        console.log("Configuring Map. CoverZoom:", coverZoom);

        // Apply MINIMUM zoom strictly -> Impossible to see black bars via zoom out
        map.setMinZoom(coverZoom);

        // Apply BOUNDS strictly -> Impossible to pan into black bars
        map.setMaxBounds(imageBounds);

        // Set Initial View
        // We use setView to center it initially.
        map.setView([h / 2, w / 2], startZoom, { animate: false });
    }

    // Run configuration
    configureMapLayout();

    // Re-run if window resizes (to keep cover logic correct)
    window.addEventListener('resize', () => {
        setTimeout(configureMapLayout, 100);
    });
};
