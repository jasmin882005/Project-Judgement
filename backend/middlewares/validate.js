const { validationResult } = require('express-validator');
const { logEvent } = require('../utils/logger');

module.exports = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));

    // log validation failure
    await logEvent({
      action: 'VALIDATION_FAILED',
      event: `Request validation failed on ${req.originalUrl}`,
      createdBy: req.user?.email || 'anonymous',
      type: 'warning',
      source: 'validateRequest'
    });

    return res.status(422).json({ errors: formattedErrors });
  }

  next(); // No errors, continue
};
