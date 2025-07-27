const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define the Alert model — stores drone alert notifications
const Alert = sequelize.define('Alert', {
  message: {
    type: DataTypes.STRING,
    allowNull: false  // Required alert message
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['info', 'warning', 'critical']]   // Alert severity level
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW   // Defaults to current time
  },
  droneId: {
    type: DataTypes.STRING,
    allowNull: false   // Drone that triggered the alert
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'alerts',     // Use fixed table name
  freezeTableName: true,    // Prevent Sequelize from pluralizing
  timestamps: true         // Adds createdAt, updatedAt automatically
});

module.exports = Alert;
