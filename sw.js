// إصدار التخزين المؤقت للتطبيق (غيّر الرقم عند الحاجة لتحديث الملفات الثابتة)
const CACHE_NAME = "omarelshafei-quran-pwa-v1";

// الملفات الأساسية المطلوبة لتشغيل واجهة التطبيق بسرعة
const CORE_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./1000529194.jpg"
];

// تثبيت Service Worker وتخزين الملفات الأساسية
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

// تفعيل النسخة الجديدة وحذف أي تخزين مؤقت قديم
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// استراتيجية الشبكة أولاً (Network-First) لضمان وصول تحديثات GitHub فوراً للجميع
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // عدم اعتراض ملفات الصوت الخارجية الكبيرة (MP3) أو واجهات API
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return networkRes;
      })
      .catch(() => caches.match(req).then((cached) => cached || caches.match("./index.html")))
  );
});
