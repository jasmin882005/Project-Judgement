// Import the JWT library
const jwt = require('jsonwebtoken');
const { tokenBlacklist } = require('./tokenBlacklist'); // Check for revoked tokens

// Middleware to verify JWT token for protected routes
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token

  // If no auth header or token
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  // If token is blacklisted
  if (tokenBlacklist.has(token)) {
    return res.status(403).json({ error: 'Token has been revoked' });
  }

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user; // Attach decoded info to request
    next(); // Allow request to proceed
  });
}

module.exports = verifyToken;
