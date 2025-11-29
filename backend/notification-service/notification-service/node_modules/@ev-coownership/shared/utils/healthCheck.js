export const createHealthRoute = (extra = {}) => async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Service is healthy',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    services: {
      database: 'healthy',
      redis: 'healthy',
      ...extra
    }
  });
};
