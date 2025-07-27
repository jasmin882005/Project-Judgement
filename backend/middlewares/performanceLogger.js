const { logEvent } = require('../utils/logger');

// Middleware to log request performance (response time, status, path)
const performanceLogger = (req, res, next) => {
  const start = Date.now();

  // Paths to exclude from logging
  const skipPaths = ['/', '/favicon.ico', '/api-docs', '/api-docs/', '/api-docs/swagger-ui.css'];

  // Hook into response completion
  res.on('finish', async () => {
    if (skipPaths.includes(req.path)) return; 
    
    const duration = Date.now() - start;
    const logMsg = `[${req.method}] ${req.originalUrl} → ${res.statusCode} in ${duration}ms`;

    // Show in console during development
    if (process.env.NODE_ENV !== 'production') {
      console.log(logMsg);
    }

    // Save performance log in DB
    await logEvent({
      action: 'PERF_METRIC',
      event: logMsg,
      createdBy: req.user?.email || 'system',
      userId: req.user?.id || null,
      type: 'info',
      source: 'performanceLogger',
    });
  });

  next();  // Continue to next middleware/route
};

module.exports = performanceLogger;
