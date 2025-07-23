const Telemetry = require('../models/Telemetry');

// POST /api/v1/telemetry
exports.receiveTelemetry = async (req, res) => {
  try {
    const { droneId, gps, altitude, speed, battery } = req.body;

    const entry = await Telemetry.create({
      droneId,
      gps,
      altitude,
      speed,
      battery
    });

    // Emit telemetry data via WebSocket
    const io = req.app.get('io');
    io.emit('telemetry-update', entry); // Broadcast to all connected clients

    res.status(201).json(entry);
  } catch (error) {
    console.error("Telemetry POST error:", error);
    res.status(500).json({ error: 'Failed to save telemetry data' });
  }
};


