const Telemetry = require('../models/Telemetry');
const { logEvent } = require('../utils/logger');

// Handle incoming telemetry data from drones
// Route: POST /api/v1/telemetry
exports.receiveTelemetry = async (req, res) => {
  try {
    const { droneId, gps, altitude, speed, battery } = req.body;

    // Basic validation to ensure key fields exist
    if (!droneId || !gps || typeof gps !== 'object' || typeof battery !== 'number') {
      return res.status(400).json({ error: 'Invalid telemetry input' });
    }

    // Broadcast telemetry in real-time to all WebSocket clients
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

    // Log success
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

    // Log failure
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
