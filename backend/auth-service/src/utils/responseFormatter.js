export const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    data,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || generateRequestId()
    }
  };

  return res.status(statusCode).json(response);
};

export const errorResponse = (res, error, statusCode = 500) => {
  const response = {
    success: false,
    error: {
      code: error.code || 'INTERNAL_ERROR',
      message: error.message || 'Internal server error',
      details: error.details || {}
    },
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || generateRequestId()
    }
  };

  return res.status(statusCode).json(response);
};

export const paginatedResponse = (res, message, data, pagination) => {
  const response = {
    success: true,
    message,
    data,
    pagination,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId || generateRequestId()
    }
  };

  return res.status(200).json(response);
};

const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};