import { ApiError } from '../utils/ApiError.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const errors = [];
    if (typeof schema === 'function') {
      const result = schema(req.body);
      if (result && result.length > 0) {
        throw new ApiError(400, 'Validation Error', result);
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
