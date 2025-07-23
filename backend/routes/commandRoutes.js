/**
 * @swagger
 * tags:
 *   name: Command
 *   description: API to send commands to drones
 */
const express = require("express");
const router = express.Router();

const { sendCommand, getCommandsByDrone } = require("../controllers/commandController");
const verifyToken = require("../middlewares/verifyToken");
const roleCheck = require("../middlewares/roleCheck"); // Add role check
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
 *     summary: Get all commands for a specific drone 
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

/**
 * @swagger
 * /api/v1/commands:
 *   get:
 *     summary: Get all commands
 *     tags: [Command]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: List of commands
 */
router.get('/', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const commands = await Command.findAll({ order: [['createdAt', 'DESC']] });
    res.json(commands);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch commands' });
  }
});

/**
 * @swagger
 * /api/v1/commands/{id}:
 *   put:
 *     summary: Update a command by ID (admin only)
 *     tags: [Command]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id 
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the command to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *               droneId:
 *                 type: string
 *               parameters:
 *                 type: object
 *     responses:
 *       200:
 *         description: Command updated successfully
 *       404:
 *         description: Command not found
 */
router.put('/:id', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Command.update(req.body, { where: { id } });

    if (!updated[0])
      return res.status(404).json({ error: 'Command not found' });

    res.json({ message: 'Command updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update command' });
  }
});

/**
 * @swagger
 * /api/v1/commands/{id}:
 *   delete:
 *     summary: Delete a command by ID (admin only)
 *     tags: [Command]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the command to delete
 *     responses:
 *       200:
 *         description: Command deleted successfully
 *       404:
 *         description: Command not found
 */
router.delete('/:id', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Command.destroy({ where: { id } });

    if (!deleted)
      return res.status(404).json({ error: 'Command not found' });

    res.json({ message: 'Command deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete command' });
  }
});

// Only admin can send drone commands
router.post("/", verifyToken, roleCheck('admin'), sendCommand);

// Get all commands for a drone 
router.get("/:droneId", verifyToken, roleCheck('admin','operator'), getCommandsByDrone);

module.exports = router;
