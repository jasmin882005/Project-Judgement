// utils/logger.js

const { Log } = require('../models');

/**
 * Centralized logging helper
 */
exports.logEvent = async ({
  action,
  event,
  userId = null,
  createdBy = 'system',
  type = 'info',
  source = 'unknown'
}) => {
  try {
    await Log.create({
      action,
      event,
      userId,
      createdBy,
      type,
      source,
    });
  } catch (err) {
    console.error('Log write failed:', err.message);
  }
};
