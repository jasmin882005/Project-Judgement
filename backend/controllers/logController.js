const { Log } = require('../models');
const { logEvent } = require('../utils/logger');

// POST /api/v1/logs → Manual log entry from frontend/admin
exports.createLog = async (req, res) => {
  try {
    const { droneId, event, type = 'info', source = 'manual', action, userId } = req.body;

    if (!event) {
      return res.status(400).json({ error: 'Event is required' });
    }

    const createdBy = req.user?.email || 'anonymous';

    const log = await Log.create({
      droneId,
      event,
      type,
      source,
      createdBy,
      action,
      userId
    });

    // Log creation of log (meta!)
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
