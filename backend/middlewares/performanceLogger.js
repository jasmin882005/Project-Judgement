const { logEvent } = require('../utils/logger');

const performanceLogger = (req, res, next) => {
  const start = Date.now();

  // Define paths to skip
  const skipPaths = ['/', '/favicon.ico', '/api-docs', '/api-docs/', '/api-docs/swagger-ui.css'];

  res.on('finish', async () => {
    if (skipPaths.includes(req.path)) return; // Skip logging for these paths

    const duration = Date.now() - start;
    const logMsg = `[${req.method}] ${req.originalUrl} → ${res.statusCode} in ${duration}ms`;

    // Console log for dev
    if (process.env.NODE_ENV !== 'production') {
      console.log(logMsg);
    }

    // Persist to DB
    await logEvent({
      action: 'PERF_METRIC',
      event: logMsg,
      createdBy: req.user?.email || 'system',
      userId: req.user?.id || null,
      type: 'info',
      source: 'performanceLogger',
    });
  });

  next();
};

module.exports = performanceLogger;
