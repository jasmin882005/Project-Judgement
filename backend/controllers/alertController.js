const Alert = require('../models/Alert');

// Create a new alert and broadcast it via WebSocket
// Route: POST /api/v1/alerts
exports.createAlert = async (req, res) => {
  try {
    const { message, level, timestamp, droneId } = req.body;
    // Save alert to DB
    const alert = await Alert.create({ message, level, timestamp, droneId });

     // Emit alert to all connected WebSocket clients
    const io = req.app.get('io');
    io.emit('alert-raised', alert); // Broadcast to all clients

    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create alert' });
  }
};

// Fetch all stored alerts
// Route: GET /api/v1/alerts
exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.findAll();
    res.status(200).json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};
