const jwt = require('jsonwebtoken');
const { isBlacklisted } = require('../utils/tokenBlacklist');
const { logEvent } = require('../utils/logger');

/**
 * JWT verification middleware for protected routes
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  // Check token blacklist
  if (isBlacklisted(token)) {
    logEvent({
      action: 'TOKEN_REJECTED',
      event: 'Blacklisted token used',
      createdBy: 'unknown',
      type: 'warning',
      source: 'verifyToken'
    });
    return res.status(403).json({ error: 'Token has been revoked' });
  }

  // Verify token signature and expiration
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      await logEvent({
        action: 'TOKEN_INVALID',
        event: 'JWT failed verification',
        createdBy: 'unknown',
        type: 'error',
        source: 'verifyToken'
      });
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user; // Attach decoded payload
    next();          // Proceed to next middleware
  });
}

module.exports = verifyToken;
