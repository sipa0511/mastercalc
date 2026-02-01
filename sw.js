// MasterCalc PRO - Service Worker v7.3
// ОТВЕЧАЕТ ЗА КЕШИРОВАНИЕ ФАЙЛОВ И ОФФЛАЙН РАБОТУ

const APP_VERSION = '7.3';
const CACHE_NAME = `mastercalc-cache-v${APP_VERSION}`;

// СПИСОК ФАЙЛОВ ДЛЯ КЕШИРОВАНИЯ
const STATIC_FILES = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon.png',
    './donate.png'
];

// ================= СОБЫТИЕ УСТАНОВКИ =================
self.addEventListener('install', event => {
    console.log('[SW] Установка версии:', APP_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Кешируем статические файлы');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                // НЕМЕДЛЕННАЯ АКТИВАЦИЯ НОВОГО SERVICE WORKER
                return self.skipWaiting();
            })
    );
});

// ================= СОБЫТИЕ АКТИВАЦИИ =================
self.addEventListener('activate', event => {
    console.log('[SW] Активация новой версии');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // УДАЛЯЕМ СТАРЫЕ КЕШИ ОТ ПРЕДЫДУЩИХ ВЕРСИЙ
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Удаляем старый кеш:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // БЕРЕМ УПРАВЛЕНИЕ ВСЕМИ ВКЛАДКАМИ
            return self.clients.claim();
        })
    );
});

// ================= ОБРАБОТКА СЕТЕВЫХ ЗАПРОСОВ =================
self.addEventListener('fetch', event => {
    // ПРОПУСКАЕМ НЕ-GET ЗАПРОСЫ
    if (event.request.method !== 'GET') {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // ЕСЛИ ФАЙЛ ЕСТЬ В КЕШЕ - ВОЗВРАЩАЕМ ЕГО
                if (cachedResponse) {
                    console.log('[SW] Из кеша:', event.request.url);
                    return cachedResponse;
                }
                
                // ИНАЧЕ ГРУЗИМ ИЗ СЕТИ
                console.log('[SW] Из сети:', event.request.url);
                return fetch(event.request)
                    .then(networkResponse => {
                        // ПРОВЕРЯЕМ ВАЛИДНОСТЬ ОТВЕТА
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        
                        // КЛОНИРУЕМ ОТВЕТ ДЛЯ СОХРАНЕНИЯ В КЕШ
                        const responseToCache = networkResponse.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return networkResponse;
                    })
                    .catch(error => {
                        console.log('[SW] Ошибка загрузки:', error);
                        
                        // ВОЗВРАЩАЕМ ЗАГРУЗОЧНУЮ СТРАНИЦУ ЕСЛИ НЕТ СЕТИ
                        if (event.request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                        
                        // ИЛИ ПРОСТО ОШИБКУ
                        return new Response('Нет соединения с интернетом', {
                            status: 503,
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});