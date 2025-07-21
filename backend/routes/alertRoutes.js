/**
 * @swagger
 * tags:
 *   name: Alert
 *   description: API for AI and drone-generated alerts
 */

const express = require('express');
const router = express.Router();
const { createAlert, getAlerts } = require('../controllers/alertController');
const verifyToken = require('../middlewares/verifyToken');
const { Alert } = require('../models'); // For PUT route

/**
 * @swagger
 * /api/v1/alerts:
 *   post:
 *     summary: Create a new alert (from drone or AI)
 *     tags: [Alert]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - level
 *               - droneId
 *             properties:
 *               message:
 *                 type: string
 *                 example: Battery below 20%
 *               level:
 *                 type: string
 *                 example: warning
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 example: 2025-07-11T10:30:00Z
 *               droneId:
 *                 type: string
 *                 example: DRN-002
 *     responses:
 *       201:
 *         description: Alert created
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', verifyToken, createAlert);

/**
 * @swagger
 * /api/v1/alerts:
 *   get:
 *     summary: Get all alerts (admin/operator)
 *     tags: [Alert]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of alerts
 *       401:
 *         description: Unauthorized
 */
router.get('/', verifyToken, getAlerts);

/**
 * @swagger
 * /api/v1/alerts/{id}:
 *   put:
 *     summary: Update an existing alert by ID
 *     tags: [Alert]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: Updated message
 *               level:
 *                 type: string
 *                 example: critical
 *     responses:
 *       200:
 *         description: Alert updated successfully
 *       404:
 *         description: Alert not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Alert.update(req.body, { where: { id } });

    if (!updated[0])
      return res.status(404).json({ error: 'Alert not found' });

    res.json({ message: 'Alert updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

router.post('/', verifyToken, createAlert);
router.get('/', verifyToken, getAlerts);

module.exports = router;
