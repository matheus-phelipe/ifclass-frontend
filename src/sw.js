// Service Worker Simplificado para PWA do IFClass
const CACHE_NAME = 'ifclass-dev-v1.0.0';

// Instalar Service Worker
self.addEventListener('install', event => {
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', event => {
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', event => {
  // Deixa as requisições passarem normalmente
});
