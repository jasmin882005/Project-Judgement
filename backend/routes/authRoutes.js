/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and authorization
 */

const express = require('express');
const router = express.Router();
const { signup, login, refreshToken, logout } = require('../controllers/authController');

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input or user already exists
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in and receive JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: JWT and refresh token returned
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /api/v1/auth/token:
 *   post:
 *     summary: Get a new access token using a refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: New access token returned
 *       401:
 *         description: Refresh token missing
 *       403:
 *         description: Invalid or expired refresh token
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout the user and invalidate the refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: User logged out successfully
 *       400:
 *         description: Refresh token required
 *       404:
 *         description: Token not found
 *       500:
 *         description: Server error during logout
 */

router.post('/signup', signup);
router.post('/login', login);
router.post('/token', refreshToken);
router.post('/logout', logout);

module.exports = router;
