/**
 * Wraps async functions to automatically catch errors and pass them to Express error handler
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Wraps controller methods with error handling and standardized response format
 * @param {Function} controllerMethod - Controller method to wrap
 * @returns {Function} Wrapped controller method
 */
const controllerHandler = (controllerMethod) => {
  return asyncHandler(async (req, res, next) => {
    const result = await controllerMethod(req, res, next);
    
    // If the controller returns a result, send it as a standardized response
    if (result !== undefined) {
      const { ApiResponse } = require('./apiResponse');
      
      if (result instanceof ApiResponse) {
        return res.status(200).json(result.toJSON());
      }
      
      // Auto-wrap non-ApiResponse results
      return res.status(200).json(ApiResponse.success('Operation successful', result).toJSON());
    }
  });
};

module.exports = { asyncHandler, controllerHandler };