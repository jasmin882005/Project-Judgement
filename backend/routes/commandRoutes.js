/**
 * @swagger
 * tags:
 *   name: Command
 *   description: API to send commands to drones
 */

/**
 * @swagger
 * /api/v1/commands:
 *   post:
 *     summary: Send command to drone (admin only)
 *     tags: [Command]
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
 *               - command
 *             properties:
 *               droneId:
 *                 type: string
 *                 example: DR-101
 *               command:
 *                 type: string
 *                 enum: [abort, reroute, return]
 *                 example: abort
 *     responses:
 *       201:
 *         description: Command created and stored
 *       400:
 *         description: Invalid command type
 *       403:
 *         description: Unauthorized or insufficient permission
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /api/v1/commands/{droneId}:
 *   get:
 *     summary: Get all commands for a specific drone (admin only)
 *     tags: [Command]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: droneId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the drone to fetch commands for
 *     responses:
 *       200:
 *         description: List of commands for the drone
 *       403:
 *         description: Unauthorized or insufficient permission
 *       404:
 *         description: Drone or commands not found
 *       500:
 *         description: Server error
 */

const express = require("express");
const router = express.Router();

const { sendCommand, getCommandsByDrone } = require("../controllers/commandController");
const verifyToken = require("../middlewares/verifyToken");
const roleCheck = require("../middlewares/roleCheck"); // Add role check

// Only admin can send drone commands
router.post("/", verifyToken, roleCheck('admin'), sendCommand);

// Get all commands for a drone (admin only)
router.get("/:droneId", verifyToken, roleCheck('admin'), getCommandsByDrone);

module.exports = router;
