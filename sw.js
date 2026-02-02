const CACHE_NAME = 'bcn-guide-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalar Service Worker y precachear app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategias de Intercepción de Red
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. ESTRATEGIA PARA MAPAS (Leaflet Tiles): Cache First
  // Guardamos las teselas del mapa agresivamente para uso offline.
  if (url.host.includes('cartocdn.com') || url.host.includes('openstreetmap.org')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          // Si está en caché, devolverlo
          if (response) return response;
          // Si no, buscar en red, devolverlo y guardarlo en caché
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // 2. ESTRATEGIA PARA RECURSOS ESTÁTICOS (JS, CSS, Fuentes): Stale While Revalidate
  // Usa la versión cacheada inmediatamente, pero actualiza en segundo plano.
  if (
    event.request.destination === 'script' ||
    event.request.destination === 'style' ||
    event.request.destination === 'font' ||
    event.request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. ESTRATEGIA PARA API (Clima): Network Only con Fallback
  // Si falla la red, no devolvemos nada (la UI lo manejará) o devolvemos un JSON de error
  if (url.pathname.includes('api.open-meteo.com')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(JSON.stringify({ error: 'offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 4. ESTRATEGIA POR DEFECTO (Navegación): Network First
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});