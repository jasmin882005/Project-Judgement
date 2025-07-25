/**
 * @swagger
 * tags:
 *   name: Private
 *   description: Protected test route (requires JWT)
 */

const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');

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
 *               message: "Hello, user 123! You accessed a protected route."
 *       401:
 *         description: Authorization header missing
 *       403:
 *         description: Token invalid or expired
 */
router.get('/', verifyToken, (req, res) => {
  res.json({ message: `Hello, user ${req.user.id}! You accessed a protected route.` });
});

module.exports = router;
