import authRoutes from './authRoutes.js';

export default (app) => {
  app.use('/api/v1/auth', authRoutes);
};