/**
 * @swagger
 * tags:
 *   name: Logs
 *   description: API for storing and retrieving drone operation logs
 */

const express = require('express');
const router = express.Router();
const { createLog, getLogs } = require('../controllers/logController');
const verifyToken = require('../middlewares/verifyToken');
const roleCheck = require('../middlewares/roleCheck');

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

/**
 * @swagger
 * /api/v1/logs:
 *   get:
 *     summary: Get all log entries (admin only)
 *     tags: [Logs]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: List of logs
 *       403:
 *         description: Forbidden
 *       401:
 *         description: Unauthorized
 */

router.post('/', verifyToken, createLog);
router.get('/', verifyToken, roleCheck('admin'), getLogs);

module.exports = router;
