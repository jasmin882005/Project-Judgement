const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define Drone model — stores drone metadata and live state
const Drone = sequelize.define('Drone', {
  droneId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Ensures each droneId is unique
  },
  model: {
    type: DataTypes.STRING,
    allowNull: true // Optional: can store drone hardware/model info
  },
  status: {
    type: DataTypes.ENUM('active', 'idle', 'offline'),
    allowNull: false // Operational state of the drone
  },
  gps: {
    type: DataTypes.JSON,
    allowNull: true // Stores latest GPS coordinates (lat/lng as JSON)
  },
  battery: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 100 // Battery percentage range validation
    }
  }
}, {
  tableName: 'drones',          // Use fixed table name
  freezeTableName: true,        // Prevent automatic pluralization
  timestamps: true              // Adds createdAt and updatedAt
});

module.exports = Drone;
