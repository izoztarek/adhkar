/**
 * رفيق — Service Worker
 * - الواجهة بتفتح فورًا من الذاكرة، وبتتحدّث في الخلفية.
 * - الصوت بيتخزن بعد أول تشغيل (ويتشغل من غير نت بعد كده).
 *
 * مهم: لما تعدّل أي ملف في الموقع (المحتوى مثلًا) زوّد رقم VERSION
 * عشان الأجهزة تاخد النسخة الجديدة. ولو بدّلت تسجيل صوت بنفس الاسم زوّد AUDIO_VERSION.
 */
const VERSION = 'v2';
const AUDIO_VERSION = 'v1';

const SHELL_CACHE = `rafeeq-shell-${VERSION}`;
const AUDIO_CACHE = `rafeeq-audio-${AUDIO_VERSION}`;

const SHELL_FILES = [
  './',
  'index.html',
  'css/style.css',
  'js/app.js',
  'js/config.js',
  'js/content.js',
  'js/prayer.js',
  'js/progress.js',
  'js/storage.js',
  'js/player.js',
  'manifest.webmanifest',
  'assets/fonts/plex-arabic-400.woff2',
  'assets/fonts/plex-arabic-600.woff2',
  'assets/fonts/amiri-400.woff2',
  'assets/icons/favicon-32.png',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
];

// صغيرين ومهمين للطريق — بيتخزنوا من أول زيارة
const PRECACHE_AUDIO = [
  'assets/audio/travel/rukoob.mp3',
  'assets/audio/travel/safar.mp3',
];

const scopeUrl = (path) => new URL(path, self.registration.scope).href;
const isAudio = (url) => url.pathname.includes('/assets/audio/');
const isAppRoot = (url) => {
  const scope = new URL(self.registration.scope);
  return url.pathname === scope.pathname || url.pathname === `${scope.pathname}index.html`;
};

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    await shell.addAll(SHELL_FILES.map((p) => new Request(scopeUrl(p), { cache: 'reload' })));
    await cacheAudio(PRECACHE_AUDIO.map(scopeUrl)).catch(() => {});
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL_CACHE, AUDIO_CACHE]);
    for (const key of await caches.keys()) {
      if (key.startsWith('rafeeq-') && !keep.has(key)) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'cache-audio' && Array.isArray(data.urls)) {
    event.waitUntil(cacheAudio(data.urls).catch(() => {}));
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isAudio(url)) {
    event.respondWith(audioResponse(request));
  } else if (request.mode === 'navigate' && isAppRoot(url)) {
    // الصفحة الرئيسية (حتى لو فيها ?c=كود) — من الذاكرة فورًا، وتتحدّث في الخلفية
    event.respondWith(staleWhileRevalidate(event, scopeUrl('index.html'), request));
  } else if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match(scopeUrl('index.html'))));
  } else {
    event.respondWith(staleWhileRevalidate(event, request.url, request));
  }
});

async function staleWhileRevalidate(event, cacheKey, request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(cacheKey, { ignoreSearch: true });
  const network = fetch(request).then((res) => {
    if (res && res.ok && res.type === 'basic') cache.put(cacheKey, res.clone());
    return res;
  });
  if (cached) {
    event.waitUntil(network.catch(() => {}));
    return cached;
  }
  return network;
}

/* ---------- الصوت ---------- */

const inflight = new Map();

async function cacheAudio(urls) {
  const cache = await caches.open(AUDIO_CACHE);
  await Promise.all(urls.map(async (u) => {
    const key = u.split('#')[0];
    if (await cache.match(key)) return;
    if (inflight.has(key)) return inflight.get(key);
    const job = fetch(key, { credentials: 'same-origin' })
      .then((res) => { if (res.ok && res.status === 200) return cache.put(key, res); return undefined; })
      .finally(() => inflight.delete(key));
    inflight.set(key, job);
    return job;
  }));
}

async function audioResponse(request) {
  const key = request.url.split('#')[0];
  const cache = await caches.open(AUDIO_CACHE);
  const cached = await cache.match(key, { ignoreSearch: true });
  if (!cached) {
    // أول مرة: من الشبكة مباشرة عشان يبدأ فورًا، ويتخزن كامل في الخلفية
    cacheAudio([key]).catch(() => {});
    return fetch(request);
  }
  return rangeResponse(request, cached);
}

/** Safari بيطلب الصوت بأجزاء (Range) — لازم نرد بـ 206 من الملف المتخزن */
async function rangeResponse(request, response) {
  const type = response.headers.get('Content-Type') || 'audio/mpeg';
  const range = request.headers.get('range');
  const blob = await response.blob();
  const size = blob.size;
  if (!range) {
    return new Response(blob, {
      status: 200,
      headers: { 'Content-Type': type, 'Content-Length': String(size), 'Accept-Ranges': 'bytes' },
    });
  }
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  let start = 0;
  let end = size - 1;
  if (m) {
    if (m[1] === '' && m[2] !== '') { start = Math.max(0, size - Number(m[2])); }
    else {
      start = Number(m[1] || 0);
      if (m[2] !== '') end = Math.min(Number(m[2]), size - 1);
    }
  }
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }
  return new Response(blob.slice(start, end + 1, type), {
    status: 206,
    headers: {
      'Content-Type': type,
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}
