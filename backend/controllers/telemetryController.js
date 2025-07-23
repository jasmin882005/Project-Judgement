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


exports.getLatestTelemetry = async (req, res) => {
  try {
    const { droneId } = req.params;

    const latest = await Telemetry.findOne({
      where: { droneId },
      order: [['createdAt', 'DESC']]
    });

    if (!latest) return res.status(404).json({ error: 'No telemetry found' });

    res.json(latest);
  } catch (error) {
    console.error('Latest telemetry error:', error);
    res.status(500).json({ error: 'Failed to fetch latest telemetry' });
  }
};
