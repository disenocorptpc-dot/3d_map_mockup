# Mobile Map Mockup Simulator

Esta es una herramienta para visualizar tu render de mapa 3D en un entorno simulado de dispositivo móvil.

## Estructura
- `index.html`: La aplicación principal.
- `style.css`: Estilos del teléfono (iPhone mockup) y la interfaz.
- `script.js`: Lógica del mapa interactivo usando Leaflet.
- `map.png`: Tu imagen del mapa (actualmente un placeholder generico).

## Cómo usar con tu propia imagen
1. Reemplaza el archivo `map.png` en esta carpeta con tu render de alta calidad.
2. Mantén el nombre `map.png` o actualiza la variable `imageUrl` en `script.js`.

## Cómo ejecutar
Para evitar problemas de seguridad del navegador con archivos locales:
1. Abre una terminal en esta carpeta (`c:/Users/rsantarosa/.gemini/antigravity/playground/frozen-copernicus/mobile-map-mockup/`).
2. Ejecuta `npx serve` (necesitas Node.js instalado).
3. Abre la URL que aparece (ej. `http://localhost:3000`).

## Opciones de Hosting para Imágenes Pesadas
Si tu imagen final pesa mucho (>50MB), considera:
1. **MapTiler / Mapbox**: La mejor opción profesional. Cortan tu imagen en "tiles" (cuadritos) para que cargue instantáneamente como Google Maps.
2. **Cloudinary**: Bueno para optimización automática y entrega rápida.
3. **AWS S3 + CloudFront**: Almacenamiento barato y rápido, standard de la industria.
