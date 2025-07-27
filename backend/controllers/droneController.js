const { Drone } = require('../models');
const { logEvent } = require('../utils/logger');

// Register a new drone
// Route: POST /api/v1/drones
exports.createDrone = async (req, res) => {
  try {
    const { droneId, model, status, battery, gps_location } = req.body;

    // Basic input validation
    if (!droneId || !model || battery === undefined || !gps_location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save drone to DB
    const drone = await Drone.create({
      droneId,
      model,
      status,
      battery,
      gps: gps_location
    });

    // Log creation
    await logEvent({
      action: 'DRONE_CREATED',
      event: `Drone ${droneId} registered`,
      createdBy: req.user?.email || 'system',
      type: 'info',
      source: 'droneController'
    });

    res.status(201).json(drone);
  } catch (error) {
    console.error('Drone creation error:', error);

    // Log failure
    await logEvent({
      action: 'DRONE_CREATION_FAILED',
      event: 'Error creating new drone',
      createdBy: req.user?.email || 'system',
      type: 'error',
      source: 'droneController'
    });

    res.status(500).json({ error: 'Failed to create drone' });
  }
};

// Get status of a specific drone
// Route: GET /api/v1/drones/:droneId
exports.getDroneStatus = async (req, res) => {
  try {
    const { droneId } = req.params;

    const drone = await Drone.findOne({ where: { droneId } });

    if (!drone) {
      await logEvent({
        action: 'DRONE_NOT_FOUND',
        event: `No drone found with ID ${droneId}`,
        type: 'warning',
        source: 'droneController'
      });

      return res.status(404).json({ error: 'Drone not found' });
    }

    // Return current drone info
    res.status(200).json({
      id: drone.id,
      droneId: drone.droneId,
      model: drone.model,
      status: drone.status,
      battery: drone.battery,
      gps_location: drone.gps,
      updatedAt: drone.updatedAt,
    });
  } catch (err) {
    await logEvent({
      action: 'DRONE_STATUS_FETCH_FAILED',
      event: 'Error retrieving drone status',
      createdBy: req.user?.email || 'system',
      type: 'error',
      source: 'droneController'
    });

    res.status(500).json({ error: 'Failed to fetch drone status' });
  }
};
