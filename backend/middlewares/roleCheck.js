const { logEvent } = require('../utils/logger');

/**
 * Role-based access control middleware
 * @param {string|string[]} requiredRoles - Allowed roles (e.g. 'admin', ['admin', 'operator'])
 */
module.exports = (requiredRoles) => {
  return async (req, res, next) => {
    const user = req.user;

    // Always treat roles as an array for uniform checks
    const allowed = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    // Deny access if user is missing or role is not allowed
    if (!user || !allowed.includes(user.role)) {
      const attemptedBy = user?.email || 'unknown';

      // Log unauthorized access attempt
      await logEvent({
        action: 'ACCESS_DENIED',
        event: `Blocked access to ${req.originalUrl} — requires role: [${allowed.join(', ')}]`,
        createdBy: attemptedBy,
        type: 'warning',
        source: 'roleCheck'
      });

      return res.status(403).json({ error: 'Access denied' });
    }

    next();  // Role is valid, proceed
  };
};
