/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: API for storing and retrieving system and drone logs
 */

const express = require('express');
const router = express.Router();
const { createLog } = require('../controllers/logController');
const verifyToken = require('../middlewares/verifyToken');
const roleCheck = require('../middlewares/roleCheck');
const { Log } = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/v1/logs:
 *   post:
 *     summary: Create a new log entry
 *     tags: [Logs]
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LogInput'
 *     responses:
 *       201:
 *         description: Log created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', verifyToken, createLog);

/**
 * @swagger
 * /api/v1/logs:
 *   get:
 *     summary: Get filtered log entries (admin only)
 *     tags: [Logs]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: query
 *         name: droneId
 *         schema:
 *           type: string
 *         description: Filter by drone ID
 *       - in: query
 *         name: event
 *         schema:
 *           type: string
 *         description: Search logs by event message
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filter logs by action type (e.g., LOGIN, LOGOUT)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [info, warning, error]
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Filter logs by system source (e.g., authController)
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter from this date
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter to this date
 *     responses:
 *       200:
 *         description: Logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LogEntry'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (non-admin)
 */
router.get('/', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const { droneId, event, action, type, source, from, to } = req.query;
    const where = {};

    if (droneId) where.droneId = droneId;
    if (event) where.event = { [Op.iLike]: `%${event}%` };
    if (action) where.action = action;
    if (type) where.type = type;
    if (source) where.source = source;

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt[Op.gte] = new Date(from);
      if (to) where.createdAt[Op.lte] = new Date(to);
    }

    const logs = await Log.findAll({
      where,
      order: [['createdAt', 'DESC']],
    });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
