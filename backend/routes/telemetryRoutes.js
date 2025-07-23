const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const { receiveTelemetry, getLatestTelemetry } = require('../controllers/telemetryController');
const verifyToken = require('../middlewares/verifyToken');
const roleCheck = require('../middlewares/roleCheck');
const { Telemetry } = require('../models');
const { fn, col } = require('sequelize');

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
 *             type: object
 *             required:
 *               - droneId
 *               - gps
 *               - altitude
 *               - speed
 *               - battery
 *             properties:
 *               droneId:
 *                 type: string
 *               gps:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lng:
 *                     type: number
 *               altitude:
 *                 type: number
 *               speed:
 *                 type: number
 *               battery:
 *                 type: number
 *     responses:
 *       201:
 *         description: Telemetry saved
 *       400:
 *         description: Invalid input
 */

// Validation middleware for structured JSON input
const telemetryValidation = [
  body('droneId')
    .isString().withMessage('droneId must be a string')
    .matches(/^[\w-]+$/).withMessage('droneId contains invalid characters'),

  body('gps')
    .isObject().withMessage('gps must be a JSON object like { "lat": ..., "lng": ... }'),
  body('gps.lat')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be a valid float between -90 and 90'),
  body('gps.lng')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be a valid float between -180 and 180'),

  body('altitude')
    .isFloat().withMessage('Altitude must be a float'),

  body('speed')
    .isFloat().withMessage('Speed must be a float'),

  body('battery')
    .isFloat({ min: 0, max: 100 }).withMessage('Battery must be a float between 0 and 100')
];

// POST: Save telemetry
router.post('/', verifyToken, telemetryValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
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
 *         description: All telemetry records fetched
 *       500:
 *         description: Failed to fetch telemetry data
 */
router.get('/all', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const records = await Telemetry.findAll({
      order: [['createdAt', 'DESC']]
    });

    res.json(records);
  } catch (error) {
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
 *         description: List of unique drone IDs
 */
router.get('/drone-ids', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const droneIds = await Telemetry.findAll({
      attributes: [[fn('DISTINCT', col('droneId')), 'droneId']],
      raw: true
    });
    res.json(droneIds.map(d => d.droneId));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch drone IDs' });
  }
});

/**
 * @swagger
 * /api/v1/telemetry/{droneId}:
 *   get:
 *     summary: Get latest telemetry record for a specific drone (admin only)
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
 *         description: Telemetry data found
 *       404:
 *         description: No telemetry found for this drone
 */
router.get('/:droneId', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const { droneId } = req.params;
    const data = await Telemetry.findOne({
      where: { droneId },
      order: [['createdAt', 'DESC']]
    });

    if (!data) {
      return res.status(404).json({ error: 'No telemetry found for this drone' });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch telemetry' });
  }
});

module.exports = router;
