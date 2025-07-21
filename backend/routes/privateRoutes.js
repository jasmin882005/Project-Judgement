// Import required modules
const express = require('express');
const router = express.Router();

// Import middleware that checks for valid JWT token
const verifyToken = require('../middlewares/verifyToken');

// GET /api/private
// This is a protected test route — only accessible if token is valid
router.get('/', verifyToken, (req, res) => {
  // If token is valid, req.user will be available (decoded JWT)
  res.json({ message: `Hello, user ${req.user.id}! You accessed a protected route.` });
});

// Export router so it can be used in server.js
module.exports = router;
