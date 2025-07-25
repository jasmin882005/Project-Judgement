const { logEvent } = require('../utils/logger');

/**
 * Role-based access middleware
 * @param {string|string[]} requiredRoles - Single role or array of allowed roles
 */
module.exports = (requiredRoles) => {
  return async (req, res, next) => {
    const user = req.user;

    // Normalize requiredRoles to array
    const allowed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    // If no user or role mismatch
    if (!user || !allowed.includes(user.role)) {
      const attemptedBy = user?.email || 'unknown';

      // Log access denied
      await logEvent({
        action: 'ACCESS_DENIED',
        event: `Blocked access to ${req.originalUrl} — requires role: [${allowed.join(', ')}]`,
        createdBy: attemptedBy,
        type: 'warning',
        source: 'roleCheck'
      });

      return res.status(403).json({ error: 'Access denied' });
    }

    next();
  };
};
