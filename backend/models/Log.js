const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define Log model — stores app-level activity and system events
const Log = sequelize.define('Log', {
  droneId: {
    type: DataTypes.STRING,
    allowNull: true // Optional: log can be tied to a drone
  },
  event: {
    type: DataTypes.STRING,
    allowNull: false // Description of what happened (e.g., "Login failed")
  },
  action: {
    type: DataTypes.STRING,
    allowNull: true // Optional label for categorization (e.g., "AUTH_ATTEMPT")
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true // Optional: associate log with a user
  },
  type: {
    type: DataTypes.ENUM('info', 'warning', 'error'),
    defaultValue: 'info' // Severity level of the log
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true // Who triggered the action (e.g., system/admin email)
  },
  source: {
    type: DataTypes.STRING,
    allowNull: true // Module where it originated (e.g., authController)
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW // When the log was created
  }
}, {
  tableName: 'logs',           // Use consistent table name
  freezeTableName: true,       // Disable pluralization
  timestamps: true             // Adds createdAt, updatedAt
});

module.exports = Log;
