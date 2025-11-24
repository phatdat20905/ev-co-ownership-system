// public/firebase-messaging-sw.js
// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase configuration (same as client-side)
const firebaseConfig = {
  apiKey: "AIzaSyCaCJaV0mLL-QhRvHqe-caMg4OgCe4ZqNg",
  authDomain: "ev-co-ownership-system.firebaseapp.com",
  projectId: "ev-co-ownership-system",
  storageBucket: "ev-co-ownership-system.firebasestorage.app",
  messagingSenderId: "1084658057087",
  appId: "1:1084658057087:web:2a715a2565f8b5b9b8a44a",
  measurementId: "G-3ZXLNJNWLF"
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  const notificationTitle = payload.notification?.title || 'Thông báo mới';
  const notificationOptions = {
    body: payload.notification?.body || 'Bạn có một thông báo mới',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: payload.data || {},
    tag: payload.data?.type || 'default',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Xem'
      },
      {
        action: 'close',
        title: 'Đóng'
      }
    ]
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Get the URL to open from notification data
  const urlToOpen = event.notification.data?.url || '/';

  // Open or focus the client window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if no matching window found
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle push event (additional handling if needed)
self.addEventListener('push', (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);
});
