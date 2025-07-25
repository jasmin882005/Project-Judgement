/**
 * @swagger
 * tags:
 *   name: Private
 *   description: Protected test route (requires JWT)
 */

const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { User } = require('../models'); // Import User model

/**
 * @swagger
 * /api/v1/private:
 *   get:
 *     summary: Access a protected route (token required)
 *     tags: [Private]
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: Successfully accessed protected route
 *         content:
 *           application/json:
 *             example:
 *               message: "Hello, Jasmin Jamadar! You accessed a protected route."
 *       401:
 *         description: Authorization header missing
 *       403:
 *         description: Token invalid or expired
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `Hello, ${user.name}! You accessed a protected route.` });
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
});

module.exports = router;
