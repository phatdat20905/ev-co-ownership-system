// src/config/firebase.js
import admin from 'firebase-admin';
import { logger } from '@ev-coownership/shared';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      // Try to load from service account key file first
      const serviceAccountPath = join(__dirname, 'ev-co-ownership-system-firebase-adminsdk-fbsvc-1451386614.json');
      
      if (fs.existsSync(serviceAccountPath)) {
        logger.info('Loading Firebase credentials from service account key file');
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
        
        logger.info('Firebase Admin SDK initialized successfully with service account key');
        return admin;
      }
      
      // Fallback to environment variables
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
      
      logger.info('Firebase Admin SDK initialized successfully with environment variables');
    }
    return admin;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK', { error: error.message, stack: error.stack });
    return null;
  }
};

export default initializeFirebase;