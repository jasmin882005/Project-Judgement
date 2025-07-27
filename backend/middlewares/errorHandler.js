const { logEvent } = require('../utils/logger');

// Centralized error handler middleware
module.exports = async (err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // In dev mode, print detailed stack trace
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Stack Trace:', err.stack);
  }

  // Log uncaught error to DB
  await logEvent({
    action: 'UNCAUGHT_ERROR',
    event: message,
    createdBy: req.user?.email || 'system',
    type: 'error',
    source: 'errorHandler'
  });

  // Respond with structured error message
  res.status(statusCode).json({ error: message });
};
