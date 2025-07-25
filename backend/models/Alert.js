const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define the Alert model
const Alert = sequelize.define('Alert', {
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['info', 'warning', 'critical']]
    }
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  droneId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  resolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'alerts',     // fix table name
  freezeTableName: true,    // Prevent Sequelize from modifying table name
  timestamps: true         // Adds createdAt, updatedAt
});

module.exports = Alert;
