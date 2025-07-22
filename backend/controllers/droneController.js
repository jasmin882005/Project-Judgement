const { Drone } = require('../models');

// Create a new drone
exports.createDrone = async (req, res) => {
  try {
    const { droneId, model, status, battery, gps_location } = req.body;

    const drone = await Drone.create({
      droneId,
      model,
      status,
      battery,
      gps: gps_location  // no stringify
    });

    res.status(201).json(drone);
  } catch (error) {
    console.error('Drone creation error:', error);
    res.status(500).json({ error: 'Failed to create drone' });
  }
};




// Get all drones
exports.getDroneStatus = async (req, res) => {
  try {
    const { droneId } = req.params;
    const drone = await Drone.findOne({ where: { droneId } });

    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }

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
    res.status(500).json({ error: 'Failed to fetch drone status' });
  }
};
