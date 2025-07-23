const { Log } = require('../models');

exports.createLog = async (req, res) => {
  try {
    const { droneId, event, type = 'info', source = 'manual' } = req.body;

    const createdBy = req.user?.email || 'anonymous';

    const log = await Log.create({
      droneId,
      event,
      type,
      source,
      createdBy
    });

    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create log' });
  }
};

