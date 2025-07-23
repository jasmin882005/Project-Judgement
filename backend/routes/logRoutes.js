/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: API for storing and retrieving drone operation logs
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
 *             type: object
 *             required:
 *               - droneId
 *               - event
 *             properties:
 *               droneId:
 *                 type: string
 *                 example: DRN-001
 *               event:
 *                 type: string
 *                 example: Battery low warning
 *     responses:
 *       201:
 *         description: Log created
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
 *         description: Filter logs by drone ID
 *       - in: query
 *         name: event
 *         schema:
 *           type: string
 *         description: Filter logs by event keyword
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Filtered list of logs
 *       403:
 *         description: Forbidden
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const { droneId, event, from, to } = req.query;
    const where = {};

    if (droneId) where.droneId = droneId;
    if (event) where.event = { [Op.iLike]: `%${event}%` };
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
