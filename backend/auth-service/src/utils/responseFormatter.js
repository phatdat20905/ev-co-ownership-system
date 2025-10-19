export const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId
    }
  });
};

export const errorResponse = (res, error, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message,
      details: error.details || {}
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId
    }
  });
};

export const paginatedResponse = (res, data, pagination) => {
  return res.status(200).json({
    success: true,
    data,
    pagination,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId
    }
  });
};