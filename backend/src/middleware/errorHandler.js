import { ApiError } from '../utils/ApiError.js';
import { ENV } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = new ApiError(409, `Duplicate value entered for ${field}. Please use another value.`);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error = new ApiError(400, `Resource not found with id of ${err.value}`);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token expired');
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(ENV.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  };

  logger.error(`${req.method} ${req.originalUrl} - ${error.statusCode}: ${error.message}`);

  return res.status(error.statusCode || 500).json(response);
};
