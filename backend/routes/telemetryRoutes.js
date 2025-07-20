const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

const { receiveTelemetry, getLatestTelemetry } = require('../controllers/telemetryController');
const verifyToken = require('../middleware/verifyToken');
const roleCheck = require('../middleware/roleCheck');
const { Telemetry } = require('../models');

/**
 * @swagger
 * /api/v1/telemetry:
 *   post:
 *     summary: Submit telemetry data
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               droneId:
 *                 type: string
 *               gps:
 *                 type: string
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

// Validation middleware
const telemetryValidation = [
  body('droneId')
    .isString().withMessage('droneId must be a string')
    .matches(/^[\w-]+$/).withMessage('droneId contains invalid characters'),

  body('gps')
    .isString().withMessage('GPS must be a string')
    .matches(/^[-0-9.,\s]+$/).withMessage('GPS must contain valid coordinates'),

  body('altitude')
    .isFloat().withMessage('Altitude must be a float'),

  body('speed')
    .isFloat().withMessage('Speed must be a float'),

  body('battery')
    .isFloat().withMessage('Battery must be a float')
];

// POST: Any authenticated user (admin/operator) can send telemetry
router.post('/', verifyToken, telemetryValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return receiveTelemetry(req, res);
});

/**
 * @swagger
 * /api/v1/telemetry/latest/{droneId}:
 *   get:
 *     summary: Get latest telemetry data for a drone
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
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
router.get('/latest/:droneId', verifyToken, roleCheck('admin'), getLatestTelemetry);

/**
 * @swagger
 * /api/v1/telemetry/drone-ids:
 *   get:
 *     summary: Get all unique drone IDs
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of unique drone IDs
 */
router.get('/drone-ids', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const droneIds = await Telemetry.findAll({
      attributes: [
        [require('sequelize').fn('DISTINCT', require('sequelize').col('droneId')), 'droneId']
      ],
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
 *     summary: Get latest telemetry record for a specific drone
 *     tags: [Telemetry]
 *     security:
 *       - bearerAuth: []
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
