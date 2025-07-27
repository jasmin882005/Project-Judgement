const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define Mission model — stores mission plans and drone assignments
const Mission = sequelize.define('Mission', {
  name: {
    type: DataTypes.STRING,
    allowNull: false // Name of the mission
  },
  objective: {
    type: DataTypes.TEXT,
    allowNull: false // Detailed goal or description of the mission
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'complete'),
    allowNull: false // Lifecycle stage of the mission
  },
  assignedDrone: {
    type: DataTypes.STRING,
    allowNull: false // Drone ID assigned to this mission
  },
  waypoints: {
    type: DataTypes.JSON,
    allowNull: true // Array of GPS waypoints (lat/lng)
  }
}, {
  tableName: 'missions',        // Use fixed table name
  freezeTableName: true,        // Prevent Sequelize from pluralizing
  timestamps: true              // Adds createdAt and updatedAt
});

module.exports = Mission;
