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
const roleCheck = require("../middlewares/roleCheck");
const { Command } = require('../models');

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
 *             allOf:
 *               - $ref: '#/components/schemas/CommandInput'
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
router.post("/", verifyToken, roleCheck('admin'), sendCommand);

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
 *         description: ID of the drone
 *     responses:
 *       200:
 *         description: List of commands
 *       403:
 *         description: Unauthorized or insufficient permission
 *       404:
 *         description: Drone or commands not found
 *       500:
 *         description: Server error
 */
router.get("/:droneId", verifyToken, roleCheck('admin', 'operator'), getCommandsByDrone);

/**
 * @swagger
 * /api/v1/commands:
 *   get:
 *     summary: Get all commands (admin only)
 *     tags: [Command]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: List of commands
 *       403:
 *         description: Forbidden
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
 *         description: ID of the command
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/CommandInput'
 *     responses:
 *       200:
 *         description: Command updated successfully
 *       404:
 *         description: Command not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Command.update(req.body, { where: { id } });

    if (!updated[0]) return res.status(404).json({ error: 'Command not found' });

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
 *         description: ID of the command
 *     responses:
 *       200:
 *         description: Command deleted successfully
 *       404:
 *         description: Command not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Command.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ error: 'Command not found' });

    res.json({ message: 'Command deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete command' });
  }
});

module.exports = router;
