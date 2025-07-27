/**
 * NOTE:
 * Redis-related code (caching missions) is currently commented out
 * due to errors during Render deployment. The rest of the logic is fully functional.
 * Uncomment Redis blocks when deploying in a Redis-supported environment.
 */

const Mission = require('../models/Mission');
const { logEvent } = require('../utils/logger');
// const redisClient = require('../utils/redisClient'); // Redis caching

// Validate mission fields before DB operations
const validateMissionInput = ({ name, objective, status, assignedDrone, waypoints }) => {
  if (!name || typeof name !== 'string') return 'Name is required and must be a string';
  if (!objective || typeof objective !== 'string') return 'Objective is required and must be a string';
  if (!status || typeof status !== 'string') return 'Status is required and must be a string';
  if (!assignedDrone || typeof assignedDrone !== 'string') return 'Assigned Drone is required and must be a string';

  if (!Array.isArray(waypoints)) return 'Waypoints must be an array of coordinates';
  for (const wp of waypoints) {
    if (typeof wp.lat !== 'number' || typeof wp.lng !== 'number') {
      return 'Each waypoint must have numeric lat and lng';
    }
  }

  return null; 
};

// Create a new mission
// Route: POST /api/missions
exports.createMission = async (req, res) => {
  try {
    const { name, objective, status, assignedDrone, waypoints } = req.body;

    const validationError = validateMissionInput({ name, objective, status, assignedDrone, waypoints });
    if (validationError) return res.status(400).json({ error: validationError });

    const mission = await Mission.create({ name, objective, status, assignedDrone, waypoints });

    // await redisClient.del('missions'); // Clear cache if Redis is used
    await logEvent({
      action: 'MISSION_CREATED',
      event: `Mission "${name}" created and assigned to ${assignedDrone}`,
      createdBy: req.user?.email || 'system',
      type: 'info',
      source: 'missionController'
    });
    
    res.status(201).json(mission);
  } catch (err) {
    await logEvent({
      action: 'MISSION_CREATE_FAILED',
      event: 'Error creating mission',
      createdBy: req.user?.email || 'system',
      type: 'error',
      source: 'missionController'
    });

    res.status(500).json({ error: 'Failed to create mission' });
  }
};

// Fetch all missions (supports Redis caching - optional)
exports.getMissions = async (req, res) => {
  // let cachedMissions;

  // // Redis caching logic
  // try {
  //   cachedMissions = await redisClient.get('missions');
  //   if (cachedMissions) {
  //     console.log('Served from Redis cache');
  //     return res.status(200).json(JSON.parse(cachedMissions));
  //   }
  // } catch (redisErr) {
  //   console.warn('Redis unavailable, fallback to DB:', redisErr.message);
  // }

  try {
    const missions = await Mission.findAll();

    // cache result
    
    // try {
    //   await redisClient.set('missions', JSON.stringify(missions), { EX: 60 });
    //   console.log('Cached missions in Redis');
    // } catch (setErr) {
    //   console.warn('Failed to cache in Redis:', setErr.message);
    // }

    res.status(200).json(missions);
  } catch (err) {
    await logEvent({
      action: 'MISSION_FETCH_FAILED',
      event: 'Error fetching missions',
      createdBy: req.user?.email || 'system',
      type: 'error',
      source: 'missionController'
    });
    
    console.error('DB Fetch Error:', err);
    res.status(500).json({ error: 'Failed to fetch missions from DB' });
  }
};


// Update an existing mission by ID
// Route: PUT /api/missions/:id
exports.updateMission = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, objective, status, assignedDrone, waypoints } = req.body;

    // Validate input
    const validationError = validateMissionInput({ name, objective, status, assignedDrone, waypoints });
    if (validationError) return res.status(400).json({ error: validationError });

    const updated = await Mission.update(
      { name, objective, status, assignedDrone, waypoints },
      { where: { id } }
    );

    if (updated[0] === 0) {
      await logEvent({
        action: 'MISSION_NOT_FOUND',
        event: `Mission with ID ${id} not found during update`,
        type: 'warning',
        source: 'missionController'
      });

      return res.status(404).json({ error: 'Mission not found' });
    }
    
    // await redisClient.del('missions');  // Clear cache after update
    await logEvent({
      action: 'MISSION_UPDATED',
      event: `Mission "${name}" updated`,
      createdBy: req.user?.email || 'system',
      type: 'info',
      source: 'missionController'
    });
    res.json({ message: "Mission updated successfully" });
  } catch (err) {
    await logEvent({
      action: 'MISSION_UPDATE_FAILED',
      event: 'Error updating mission',
      createdBy: req.user?.email || 'system',
      type: 'error',
      source: 'missionController'
    });
    
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ error: "Failed to update mission" });
  }
};
