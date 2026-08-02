/**
 * Standard app error you can `throw` from any controller:
 *   throw new AppError("Shop not found", 404);
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

// Wrap async route handlers so thrown errors reach errorHandler
// instead of crashing the process. Usage: router.get("/", asyncHandler(fn))
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function notFoundHandler(req, res, _next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

// Must be registered LAST, after all routes.
function errorHandler(err, req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Prisma known error codes
  if (err.code === "P2002") {
    statusCode = 409;
    message = `A record with this ${err.meta?.target?.join(", ") || "value"} already exists`;
  }
  if (err.code === "P2025") {
    statusCode = 404;
    message = "Record not found";
  }

  if (process.env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

module.exports = { AppError, asyncHandler, notFoundHandler, errorHandler };
