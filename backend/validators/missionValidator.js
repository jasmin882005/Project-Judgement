// validators/missionValidator.js
const { body } = require('express-validator');

exports.missionValidationRules = [
  body('name')
    .notEmpty().withMessage('Mission name is required')
    .isString().withMessage('Mission name must be a string'),

  body('objective')
    .notEmpty().withMessage('Objective is required')
    .isString().withMessage('Objective must be a string'),

  body('status')
    .isIn(['pending', 'active', 'completed'])
    .withMessage('Status must be one of: pending, active, completed'),

  body('assignedDrone')
    .notEmpty().withMessage('Drone ID is required')
    .isString().withMessage('Drone ID must be a string'),

  body('waypoints')
    .isArray({ min: 1 }).withMessage('Waypoints must be a non-empty array'),

  body('waypoints.*.lat')
    .isFloat({ min: -90, max: 90 }).withMessage('Waypoint latitude must be between -90 and 90'),

  body('waypoints.*.lng')
    .isFloat({ min: -180, max: 180 }).withMessage('Waypoint longitude must be between -180 and 180')
];
