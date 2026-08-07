// Service Worker para Mis Raízes (PWA)
// Implementa un passthrough básico para cumplir con los requisitos de instalación sin causar problemas de caché.

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  self.clients.claim();
});

// El evento fetch es obligatorio para que los navegadores móviles muestren la opción de instalar como App
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
