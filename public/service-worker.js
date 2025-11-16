// Service Worker per MicroASM
// Versione cache - incrementare per invalidare cache precedenti
const CACHE_VERSION = 'v1';
const CACHE_NAME = `microasm-${CACHE_VERSION}`;

// Risorse da pre-cachare (critiche per l'app)
const PRECACHE_URLS = [
  '/',
  '/index.html',
];

// Pattern di risorse da cachare dinamicamente
const CACHE_PATTERNS = {
  // Assets statici (JS, CSS, fonts) - cache-first strategy
  static: /\.(js|css|woff2?|ttf|otf|eot)$/,
  
  // Immagini - cache-first strategy
  images: /\.(png|jpg|jpeg|svg|gif|webp|ico)$/,
  
  // API Supabase - network-first strategy
  supabase: /supabase\.co/,
  
  // Google Fonts - cache-first strategy
  fonts: /fonts\.(googleapis|gstatic)\.com/,
};

// Installazione Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pre-caching critical resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting()) // Attiva immediatamente
  );
});

// Attivazione Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // Elimina cache vecchie
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim()) // Prendi controllo dei client esistenti
  );
});

// Strategia di caching intelligente
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora richieste non-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignora richieste chrome-extension
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Strategia per assets statici (JS, CSS, fonts) - CACHE FIRST
  if (CACHE_PATTERNS.static.test(url.pathname) || 
      CACHE_PATTERNS.fonts.test(url.hostname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Strategia per immagini - CACHE FIRST
  if (CACHE_PATTERNS.images.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Strategia per API Supabase - NETWORK FIRST
  if (CACHE_PATTERNS.supabase.test(url.hostname)) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Default: NETWORK FIRST per tutto il resto
  event.respondWith(networkFirst(request));
});

// CACHE FIRST strategy - usa cache se disponibile, altrimenti network
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[SW] Cache HIT:', request.url);
    return cached;
  }

  console.log('[SW] Cache MISS, fetching:', request.url);
  try {
    const response = await fetch(request);
    
    // Cacha solo risposte OK
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    // Ritorna una risposta offline se disponibile
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// NETWORK FIRST strategy - prova network prima, fallback su cache
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    const response = await fetch(request);
    
    // Cacha solo risposte OK
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    console.log('[SW] Network SUCCESS:', request.url);
    return response;
  } catch (error) {
    console.log('[SW] Network FAILED, trying cache:', request.url);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('[SW] Cache fallback HIT:', request.url);
      return cached;
    }
    
    console.error('[SW] No cache available for:', request.url);
    throw error;
  }
}

// Gestione messaggi dal client (per future estensioni)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
