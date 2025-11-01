// src/config/firebase.js
import admin from 'firebase-admin';
import { logger } from '@ev-coownership/shared';

const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
      
      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        logger.warn('Firebase credentials not provided, push notifications will be disabled');
        return null;
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      
      logger.info('Firebase Admin SDK initialized successfully');
    }
    return admin;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK', { error: error.message });
    return null;
  }
};

export default initializeFirebase;