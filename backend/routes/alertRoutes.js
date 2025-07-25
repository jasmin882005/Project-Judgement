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
const roleCheck = require('../middlewares/roleCheck');
const { Alert } = require('../models');

/**
 * @swagger
 * /api/v1/alerts:
 *   post:
 *     summary: Create a new alert (from drone or AI)
 *     tags: [Alert]
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlertInput'
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
 *     summary: Get all alerts
 *     tags: [Alert]
 *     security:
 *       - JWTAuth: []
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
 *     summary: Update an existing alert by ID (admin only)
 *     tags: [Alert]
 *     security:
 *       - JWTAuth: []
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
 *             $ref: '#/components/schemas/AlertInput'
 *     responses:
 *       200:
 *         description: Alert updated successfully
 *       404:
 *         description: Alert not found
 *       500:
 *         description: Server error
 */
router.put('/:id', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Alert.update(req.body, { where: { id } });

    if (!updated[0]) return res.status(404).json({ error: 'Alert not found' });

    res.json({ message: 'Alert updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

/**
 * @swagger
 * /api/v1/alerts/{id}/resolve:
 *   put:
 *     summary: Mark an alert as resolved (admin only)
 *     tags: [Alert]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Alert ID to mark as resolved
 *     responses:
 *       200:
 *         description: Alert marked as resolved
 *         content:
 *           application/json:
 *             example:
 *               message: Alert resolved
 *       404:
 *         description: Alert not found
 *         content:
 *           application/json:
 *             example:
 *               error: Alert not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             example:
 *               error: Failed to update alert
 */
router.put('/:id/resolve', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByPk(id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    alert.resolved = true;
    await alert.save();

    res.json({ message: 'Alert marked as resolved', alert });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

module.exports = router;
