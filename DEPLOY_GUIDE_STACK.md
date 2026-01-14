# Guía de Despliegue: Mockup de Mapa 3D

Esta guía detalla cómo integrar este prototipo en tu stack profesional estándar: **GitHub** (Código), **Vercel** (Despliegue) y **Firebase** (Almacenamiento de Assets/Base de Datos).

## Arquitectura Sugerida
Para un archivo de mapa "muy grande", no es recomendable guardarlo directamente en Git/GitHub.
*   **Código (HTML, CSS, JS)**: Se aloja en **GitHub**.
*   **Hosting Web**: Se procesa en **Vercel**.
*   **Imagen del Mapa (Heavy Asset)**: Se aloja en **Firebase Storage**.

---

## Paso 1: Firebase Storage (Alojando el Mapa)
Como mencionaste que el render pesa mucho, usaremos Firebase Storage para servirlo rápidamente sin saturar tu repositorio de código.

1.  Ve a tu consola de **Firebase** > **Storage**.
2.  Crea una carpeta llamada `maps` o `mockups`.
3.  Sube tu archivo de render final (ej. `gran_mapa_final.png`).
4.  Una vez subido, haz clic en el archivo y copia la **"URL de descarga"** (token de acceso).
    *   *Nota: Asegúrate de que las reglas de Storage permitan lectura pública (`allow read;`) o configura el acceso adecuadamente.*

## Paso 2: Actualizar el Código
1.  Abre `script.js`.
2.  Busca la línea `const imageUrl = 'map.png';`.
3.  Reemplázala con tu nueva URL de Firebase:
    ```javascript
    const imageUrl = 'https://firebasestorage.googleapis.com/v0/b/TU-PROYECTO.appspot.com/o/maps%2Fgran_mapa.png?...';
    ```
4.  Ahora tu código es ligero y la imagen carga desde la nube.

## Paso 3: GitHub (Control de Versiones)
Sube este código limpio (sin la imagen png gigante) a GitHub.

1.  Crea un nuevo repositorio en GitHub (ej. `mobile-map-concept`).
2.  En tu terminal (dentro de esta carpeta):
    ```bash
    git init
    git add .
    # Si aún tienes el 'map.png' local de prueba, añádelo a .gitignore para no subirlo
    echo "map.png" >> .gitignore
    git commit -m "Initial commit: Mobile Map Mockup con Leaflet"
    git branch -M main
    git remote add origin https://github.com/TU_USUARIO/mobile-map-concept.git
    git push -u origin main
    ```

## Paso 4: Vercel (Despliegue)
1.  Ve a tu dashboard de **Vercel**.
2.  Click en **"Add New Project"**.
3.  Importa el repositorio `mobile-map-concept` desde tu GitHub.
4.  Como es HTML/JS puro, Vercel detectará todo automáticamente. No necesitas configurar comandos de build.
5.  Click **Deploy**.

## (Opcional) Paso 5: Integración con Firebase Database
Si en el futuro quieres guardar "Pines" o "Marcadores" en el mapa:
1.  Instala el SDK de Firebase en `index.html`.
2.  Configura tu `firebaseConfig` en `script.js`.
3.  Usa **Firestore** para guardar coordenadas:
    ```javascript
    // Ejemplo conceptual
    db.collection('pines').add({
        lat: 500,
        lng: 800,
        titulo: 'Castillo Principal'
    });
    ```
