/**
 * @swagger
 * tags:
 *   name: Drone
 *   description: Drone registration and listing
 */

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


const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const roleCheck = require('../middlewares/roleCheck');
const { createDrone, getDroneStatus, getAllDrones } = require('../controllers/droneController');

// Add drone — admin only
router.post('/', verifyToken, roleCheck('admin'), createDrone);


// View single drone status
router.get('/status/:droneId', verifyToken, getDroneStatus);

module.exports = router;
