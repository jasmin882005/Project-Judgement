const { logEvent } = require('../utils/logger');

module.exports = async (err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Log to console only in dev
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Stack Trace:', err.stack);
  }

  // Log error to Log table
  await logEvent({
    action: 'UNCAUGHT_ERROR',
    event: message,
    createdBy: req.user?.email || 'system',
    type: 'error',
    source: 'errorHandler'
  });

  res.status(statusCode).json({ error: message });
};
