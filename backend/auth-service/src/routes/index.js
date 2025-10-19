import authRoutes from './authRoutes.js';
import kycRoutes from './kycRoutes.js';

export default (app) => {
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/auth', kycRoutes);
};