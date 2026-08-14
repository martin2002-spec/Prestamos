// Service Worker mínimo — solo lo necesario para que el navegador
// permita "Instalar" la app. No guarda datos del negocio (esos siempre
// vienen de Firebase en tiempo real), solo el "cascarón" de la app para
// que abra más rápido y puedas ver una pantalla si te quedas sin internet.

const CACHE_NAME = 'prestamos-app-v1';
const ARCHIVOS_CASCARON = [
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_CASCARON))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((nombres) =>
            Promise.all(
                nombres
                    .filter((nombre) => nombre !== CACHE_NAME)
                    .map((nombre) => caches.delete(nombre))
            )
        )
    );
    self.clients.claim();
});

// Estrategia: intenta la red primero (para que Firebase y tus datos
// siempre estén al día); si no hay internet, muestra el cascarón guardado.
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((respuesta) => {
                const copia = respuesta.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
                return respuesta;
            })
            .catch(() => caches.match(event.request).then((r) => r || caches.match('./index.html')))
    );
});
