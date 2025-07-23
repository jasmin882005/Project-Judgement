// Import required Sequelize components
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Your DB connection instance

// Define the Alert model (table: Alerts)
const Alert = sequelize.define('Alert', {
  // The alert message content (e.g., "Obstacle detected")
  message: DataTypes.STRING,

  // Severity level: e.g., "info", "warning", or "critical"
  level: DataTypes.STRING,

  // When the alert was triggered
  timestamp: DataTypes.DATE,

  // ID of the drone that sent the alert
  droneId: DataTypes.STRING,
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false  
  }
});

// Export the model for use in controllers and other parts of the app
module.exports = Alert;
