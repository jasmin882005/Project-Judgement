const Telemetry = require('../models/Telemetry');
const { logEvent } = require('../utils/logger');

// POST /api/v1/telemetry → Receive drone telemetry
exports.receiveTelemetry = async (req, res) => {
  try {
    const { droneId, gps, altitude, speed, battery } = req.body;

    // Basic validation
    if (!droneId || !gps || typeof gps !== 'object' || typeof battery !== 'number') {
      return res.status(400).json({ error: 'Invalid telemetry input' });
    }

    const entry = await Telemetry.create({
      droneId,
      gps,
      altitude,
      speed,
      battery
    });

    // Broadcast to WebSocket clients
    const io = req.app.get('io');
    io.emit('telemetry-update', entry);

    // Log telemetry received
    await logEvent({
      action: 'TELEMETRY_RECEIVED',
      event: `Telemetry received for drone ${droneId}`,
      createdBy: req.user?.email || 'system',
      type: 'info',
      source: 'telemetryController'
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error("Telemetry POST error:", error);

    await logEvent({
      action: 'TELEMETRY_FAILED',
      event: 'Failed to save telemetry data',
      createdBy: req.user?.email || 'system',
      type: 'error',
      source: 'telemetryController'
    });

    res.status(500).json({ error: 'Failed to save telemetry data' });
  }
};
