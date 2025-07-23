/**
 * @swagger
 * tags:
 *   name: Drone
 *   description: Drone registration and listing
 */
const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const roleCheck = require('../middlewares/roleCheck');
const { createDrone, getDroneStatus, getAllDrones } = require('../controllers/droneController');

/**
 * @swagger
 * /api/v1/drones:
 *   post:
 *     summary: Add a new drone (admin only)
 *     tags: [Drone]
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - droneId
 *               - status
 *               - battery
 *             properties:
 *               droneId:
 *                 type: string
 *                 example: DRN-001
 *               model:
 *                 type: string
 *                 example: DJI Mavic 3
 *               status:
 *                 type: string
 *                 example: active
 *               battery:
 *                 type: number
 *                 example: 87
 *               gps_location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: 22.57
 *                   lng:
 *                     type: number
 *                     example: 88.36
 *     responses:
 *       201:
 *         description: Drone added successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/v1/drones/status/{droneId}:
 *   get:
 *     summary: Get status of a specific drone by ID
 *     tags: [Drone]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: droneId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the drone
 *     responses:
 *       200:
 *         description: Drone status found
 *       404:
 *         description: Drone not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/v1/drones/{id}:
 *   put:
 *     summary: Update an existing drone by ID (admin only)
 *     tags: [Drone]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the drone to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *                 example: active
 *               model:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Drone updated successfully
 *       404:
 *         description: Drone not found
 */
router.put('/:id', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Drone.update(req.body, { where: { id } });

    if (!updated[0])
      return res.status(404).json({ error: 'Drone not found' });

    res.json({ message: 'Drone updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update drone' });
  }
});

/**
 * @swagger
 * /api/v1/drones/{id}:
 *   delete:
 *     summary: Delete a drone by ID (admin only)
 *     tags: [Drone]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the drone to delete
 *     responses:
 *       200:
 *         description: Drone deleted successfully
 *       404:
 *         description: Drone not found
 */
router.delete('/:id', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Drone.destroy({ where: { id } });

    if (!deleted)
      return res.status(404).json({ error: 'Drone not found' });

    res.json({ message: 'Drone deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete drone' });
  }
});

// Add drone — admin only
router.post('/', verifyToken, roleCheck('admin'), createDrone);


// View single drone status
router.get('/status/:droneId', verifyToken, getDroneStatus);

module.exports = router;
