/**
 * @swagger
 * tags:
 *   name: Telemetry
 *   description: Real-time telemetry tracking from drones
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { receiveTelemetry } = require('../controllers/telemetryController');
const verifyToken = require('../middlewares/verifyToken');
const roleCheck = require('../middlewares/roleCheck');
const { Telemetry } = require('../models');
const { fn, col } = require('sequelize');

// Validation middleware
const telemetryValidation = [
  body('droneId')
    .isString().withMessage('droneId must be a string')
    .matches(/^[\w-]+$/).withMessage('droneId contains invalid characters'),
  body('gps')
    .isObject().withMessage('gps must be a JSON object like { "lat": ..., "lng": ... }'),
  body('gps.lat')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('gps.lng')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('altitude')
    .isFloat().withMessage('Altitude must be a float'),
  body('speed')
    .isFloat().withMessage('Speed must be a float'),
  body('battery')
    .isFloat({ min: 0, max: 100 }).withMessage('Battery must be between 0 and 100'),
];

/**
 * @swagger
 * /api/v1/telemetry:
 *   post:
 *     summary: Submit telemetry data
 *     tags: [Telemetry]
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TelemetryInput'
 *     responses:
 *       201:
 *         description: Telemetry saved
 *       400:
 *         description: Invalid input
 */
router.post('/', verifyToken, telemetryValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return receiveTelemetry(req, res);
});

/**
 * @swagger
 * /api/v1/telemetry/all:
 *   get:
 *     summary: Get all telemetry records (admin only)
 *     tags: [Telemetry]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: All telemetry records
 *       500:
 *         description: Failed to fetch data
 */
router.get('/all', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const records = await Telemetry.findAll({ order: [['createdAt', 'DESC']] });
    res.json(records);
  } catch {
    res.status(500).json({ error: 'Failed to fetch telemetry records' });
  }
});

/**
 * @swagger
 * /api/v1/telemetry/drone-ids:
 *   get:
 *     summary: Get all unique drone IDs (admin only)
 *     tags: [Telemetry]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: List of drone IDs
 *       500:
 *         description: Fetch failed
 */
router.get('/drone-ids', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const droneIds = await Telemetry.findAll({
      attributes: [[fn('DISTINCT', col('droneId')), 'droneId']],
      raw: true
    });
    res.json(droneIds.map(d => d.droneId));
  } catch {
    res.status(500).json({ error: 'Failed to fetch drone IDs' });
  }
});

/**
 * @swagger
 * /api/v1/telemetry/{droneId}:
 *   get:
 *     summary: Get latest telemetry for a specific drone (admin only)
 *     tags: [Telemetry]
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
 *         description: Latest telemetry record
 *       404:
 *         description: Telemetry not found
 *       500:
 *         description: Fetch error
 */
router.get('/:droneId', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const { droneId } = req.params;
    const data = await Telemetry.findOne({
      where: { droneId },
      order: [['createdAt', 'DESC']]
    });

    if (!data) return res.status(404).json({ error: 'No telemetry found for this drone' });

    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to fetch telemetry' });
  }
});

module.exports = router;
