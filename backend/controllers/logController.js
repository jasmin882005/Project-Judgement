const { Log } = require('../models');
const { logEvent } = require('../utils/logger');

// Manually create a log entry (admin/frontend use)
// Route: POST /api/v1/logs
exports.createLog = async (req, res) => {
  try {
    const { droneId, event, type = 'info', source = 'manual', action, userId } = req.body;

    // Validate mandatory field
    if (!event) {
      return res.status(400).json({ error: 'Event is required' });
    }

    const createdBy = req.user?.email || 'anonymous';

    // Save log to DB
    const log = await Log.create({
      droneId,
      event,
      type,
      source,
      createdBy,
      action,
      userId
    });

    // Log that a manual log was created
    await logEvent({
      action: 'LOG_MANUAL_CREATE',
      event: `Manual log created with event: ${event}`,
      createdBy,
      type: 'info',
      source: 'logController'
    });

    res.status(201).json(log);
  } catch (err) {
    await logEvent({
      action: 'LOG_CREATE_FAILED',
      event: 'Error while creating manual log',
      createdBy: req.user?.email || 'anonymous',
      type: 'error',
      source: 'logController'
    });

    res.status(500).json({ error: 'Failed to create log' });
  }
};
