/**
 * @swagger
 * tags:
 *   name: Mission
 *   description: Mission planning and control APIs
 */

const express = require('express');
const router = express.Router();

const {
  createMission,
  getMissions,
  updateMission
} = require('../controllers/missionController');

const verifyToken = require('../middlewares/verifyToken');
const roleCheck = require('../middlewares/roleCheck');
const { missionValidationRules } = require('../validators/missionValidator');
const validate = require('../middlewares/validate');
const { Mission } = require('../models');

/**
 * @swagger
 * /api/v1/missions:
 *   post:
 *     summary: Create a new mission (admin only)
 *     tags: [Mission]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - objective
 *               - status
 *               - assignedDrone
 *             properties:
 *               name:
 *                 type: string
 *                 example: Operation Sentinel
 *               objective:
 *                 type: string
 *                 example: Monitor Zone 5 for activity
 *               status:
 *                 type: string
 *                 example: pending
 *               assignedDrone:
 *                 type: string
 *                 example: DRN-001
 *               waypoints:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                       example: 22.57
 *                     lng:
 *                       type: number
 *                       example: 88.36
 *     responses:
 *       201:
 *         description: Mission created
 *       403:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/missions:
 *   get:
 *     summary: Get all missions
 *     tags: [Mission]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of missions
 *       403:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/missions/{id}:
 *   get:
 *     summary: Get a mission by ID
 *     tags: [Mission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mission details
 *       404:
 *         description: Mission not found
 */

/**
 * @swagger
 * /api/v1/missions/{id}:
 *   put:
 *     summary: Update a mission (admin only)
 *     tags: [Mission]
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
 *               name:
 *                 type: string
 *               objective:
 *                 type: string
 *               status:
 *                 type: string
 *               assignedDrone:
 *                 type: string
 *               waypoints:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     lat:
 *                       type: number
 *                     lng:
 *                       type: number
 *     responses:
 *       200:
 *         description: Mission updated successfully
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Mission not found
 */

/**
 * @swagger
 * /api/v1/missions/{id}:
 *   delete:
 *     summary: Delete a mission by ID (admin only)
 *     tags: [Mission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mission deleted
 *       404:
 *         description: Mission not found
 */

// Route: POST /api/v1/missions
router.post(
  '/',
  verifyToken,
  roleCheck('admin'),
  missionValidationRules,
  validate,
  createMission
);

// Route: GET /api/v1/missions
router.get('/', verifyToken, getMissions);

// Route: GET /api/v1/missions/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const mission = await Mission.findByPk(id);

    if (!mission) {
      return res.status(404).json({ error: 'Mission not found' });
    }

    res.json(mission);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch mission' });
  }
});

// Route: PUT /api/v1/missions/:id
router.put(
  '/:id',
  verifyToken,
  roleCheck('admin'),
  missionValidationRules,
  validate,
  updateMission
);

// Route: DELETE /api/v1/missions/:id
router.delete('/:id', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Mission.destroy({ where: { id } });

    if (!deleted) return res.status(404).json({ error: 'Mission not found' });

    res.json({ message: 'Mission deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete mission' });
  }
});

module.exports = router;
