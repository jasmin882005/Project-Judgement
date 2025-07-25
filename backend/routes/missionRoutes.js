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
 *       - JWTAuth: []
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
 *         description: Mission created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized access
 */
router.post(
  '/',
  verifyToken,
  roleCheck('admin'),
  missionValidationRules,
  validate,
  createMission
);

/**
 * @swagger
 * /api/v1/missions:
 *   get:
 *     summary: Get all missions
 *     tags: [Mission]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: List of missions retrieved successfully
 *       403:
 *         description: Unauthorized
 */
router.get('/', verifyToken, getMissions);

/**
 * @swagger
 * /api/v1/missions/{id}:
 *   get:
 *     summary: Get a mission by ID
 *     tags: [Mission]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Mission ID
 *     responses:
 *       200:
 *         description: Mission details retrieved
 *       404:
 *         description: Mission not found
 */
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

/**
 * @swagger
 * /api/v1/missions/{id}:
 *   put:
 *     summary: Update a mission by ID (admin only)
 *     tags: [Mission]
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
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Mission not found
 */
router.put(
  '/:id',
  verifyToken,
  roleCheck('admin'),
  missionValidationRules,
  validate,
  updateMission
);

/**
 * @swagger
 * /api/v1/missions/{id}:
 *   delete:
 *     summary: Delete a mission by ID (admin only)
 *     tags: [Mission]
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the mission
 *     responses:
 *       200:
 *         description: Mission deleted successfully
 *       404:
 *         description: Mission not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, roleCheck('admin'), async (req, res) => {
  try {
    const id = req.params.id;
    const deleted = await Mission.destroy({ where: { id } });

    if (!deleted)
      return res.status(404).json({ error: 'Mission not found' });

    res.json({ message: 'Mission deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete mission' });
  }
});

module.exports = router;
