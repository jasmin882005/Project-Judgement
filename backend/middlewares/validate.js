const { validationResult } = require('express-validator');
const { logEvent } = require('../utils/logger');

// Middleware to handle request validation errors (used with express-validator)
module.exports = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));

    // Log validation error
    await logEvent({
      action: 'VALIDATION_FAILED',
      event: `Request validation failed on ${req.originalUrl}`,
      createdBy: req.user?.email || 'anonymous',
      type: 'warning',
      source: 'validateRequest'
    });

    // Return 422 with structured error details
    return res.status(422).json({ errors: formattedErrors });
  }

  next(); // Input is valid → proceed
};
