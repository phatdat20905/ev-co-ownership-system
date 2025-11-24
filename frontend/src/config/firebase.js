// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Firebase configuration from your Firebase Console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCaCJaV0mLL-QhRvHqe-caMg4OgCe4ZqNg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ev-co-ownership-system.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ev-co-ownership-system",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ev-co-ownership-system.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1084658057087",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1084658057087:web:2a715a2565f8b5b9b8a44a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3ZXLNJNWLF"
};

// VAPID Key for Web Push
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BAKwTkpFfbJuHG8Ke-09M1AZpdL8ggqSdOjcgF-g-zOVqzTlZftcmQmaPhbQyqj1kATczFi3iQKX9s1UBrdJKyI";

let app = null;
let messaging = null;

/**
 * Initialize Firebase app
 */
export const initializeFirebase = async () => {
  try {
    // Check if messaging is supported
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase messaging is not supported in this browser');
      return null;
    }

    // Initialize Firebase app
    if (!app) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized');
    }

    // Initialize messaging
    if (!messaging) {
      messaging = getMessaging(app);
      console.log('✅ Firebase Messaging initialized');
    }

    return messaging;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return null;
  }
};

/**
 * Request notification permission and get FCM token
 * @returns {Promise<string|null>} FCM token or null if permission denied
 */
export const requestNotificationPermission = async () => {
  try {
    const messagingInstance = await initializeFirebase();
    if (!messagingInstance) {
      console.warn('Messaging not supported');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messagingInstance, {
        vapidKey: VAPID_KEY
      });
      
      if (token) {
        console.log('✅ FCM token obtained:', token.substring(0, 20) + '...');
        return token;
      } else {
        console.warn('No registration token available');
        return null;
      }
    } else if (permission === 'denied') {
      console.warn('❌ Notification permission denied');
      return null;
    } else {
      console.log('⚠️  Notification permission dismissed');
      return null;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return null;
  }
};

/**
 * Setup foreground message listener
 * @param {Function} callback - Callback function to handle messages
 */
export const setupMessageListener = (callback) => {
  if (!messaging) {
    console.warn('Messaging not initialized');
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('📬 Received foreground message:', payload);
    
    if (callback && typeof callback === 'function') {
      callback(payload);
    }
    
    // Show browser notification
    if (payload.notification) {
      showNotification(
        payload.notification.title,
        payload.notification.body,
        payload.notification.image,
        payload.data
      );
    }
  });

  return unsubscribe;
};

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} icon - Notification icon URL
 * @param {Object} data - Additional data
 */
export const showNotification = (title, body, icon, data = {}) => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: icon || '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data,
      tag: data.type || 'default',
      requireInteraction: false,
      silent: false
    });

    notification.onclick = (event) => {
      event.preventDefault();
      
      // Handle notification click
      if (data.url) {
        window.open(data.url, '_blank');
      }
      
      notification.close();
    };
  }
};

/**
 * Delete FCM token
 * @returns {Promise<boolean>} Success status
 */
export const deleteToken = async () => {
  try {
    if (!messaging) {
      return false;
    }

    const { deleteToken: deleteTokenFn } = await import('firebase/messaging');
    await deleteTokenFn(messaging);
    console.log('✅ FCM token deleted');
    return true;
  } catch (error) {
    console.error('Error deleting FCM token:', error);
    return false;
  }
};

export { messaging, app };
export default {
  initializeFirebase,
  requestNotificationPermission,
  setupMessageListener,
  showNotification,
  deleteToken
};
