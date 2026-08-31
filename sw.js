// Service Worker do To-Dos LG — necessário para notificações push funcionarem
// mesmo com o app fechado, no iOS (a partir da versão 16.4) e em outras plataformas.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Chega uma notificação push do servidor (enviada pelo Cloudflare Worker)
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: "To-Dos LG", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "To-Dos LG — Prioridades";
  const options = {
    body: data.body || "",
    icon: "icon-192.png",
    badge: "icon-192.png",
    data: { url: data.url || "./index.html" },
    tag: "todos-lg-daily",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Usuário tocou na notificação — abre (ou foca) o app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "./index.html";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
