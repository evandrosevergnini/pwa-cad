const CACHE_STATIC = "static-v1";
const CACHE_DINAMIC = "dinamic-v1";
const CACHE_DATA = "data-v1";
const INDEXEDDB_VERSION = 1;
const ASSETS_TO_PRECACHE = [
  "/",
  "/index.html",
  "/main.js",
  "/assets/styles/main.css",
  "/manifest.json",
  "/assets/svg/logo.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then((cache) => cache.addAll(ASSETS_TO_PRECACHE))
      .catch((error) => console.error(`[Service Worker] Evento install`, error))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_STATIC && key !== CACHE_DINAMIC)
              return caches.delete(key);
          })
        );
      })
      .catch((error) =>
        console.error(`[Service Worker] Evento activate`, error)
      )
  );
});

self.addEventListener("fetch", (event) => {
  if (!(event.request.url.indexOf("http") === 0)) return;
  const URL = event.request.url;
  if (URL === "https://jsonplaceholder.typicode.com/users") {
    event.respondWith(
      fetch(event.request)
        .then((responseFromNetwork) => {
          return caches.open(CACHE_DATA).then((cache) => {
            // armazena a resposta no cache
            cache.put(URL, responseFromNetwork.clone());
            return responseFromNetwork;
          });
        })
        .catch(() => {
          // se a resposta do backend falhar, tenta recuperar do cache, se existir
          return caches.match(event.request).then((cache) => {
            if (cache) return cache;
          });
        })
    );
  } else {
    event.respondWith(
      // Procura no cache
      caches
        .match(event.request)
        .then((responseOnCache) => {
          // se encontrar no cache retorna do cache
          if (responseOnCache) return responseOnCache;
          // senão busca no backend
          return fetch(event.request).then((responseFromNetwork) => {
            return caches.open(CACHE_DINAMIC).then((cacheDinamic) => {
              // armazena a resposta no cache
              cacheDinamic.put(event.request.url, responseFromNetwork.clone());
              return responseFromNetwork;
            });
          });
        })
        .catch(error => console.error(err))
    );
  }
});
