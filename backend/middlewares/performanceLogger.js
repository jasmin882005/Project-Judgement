const { logEvent } = require('../utils/logger');

const performanceLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', async () => {
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
      type: 'info',
      source: 'performanceLogger'
    });
  });

  next();
};

module.exports = performanceLogger;
