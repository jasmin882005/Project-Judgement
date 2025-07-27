const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define Telemetry model — stores real-time drone telemetry data
const Telemetry = sequelize.define('Telemetry', {
  droneId: {
    type: DataTypes.STRING,
    allowNull: false // Drone identifier
  },
  gps: {
    type: DataTypes.JSON,
    allowNull: false // Latitude and longitude as JSON (e.g., { lat, lng })
  },
  altitude: {
    type: DataTypes.FLOAT,
    allowNull: true // Altitude in meters (optional)
  },
  speed: {
    type: DataTypes.FLOAT,
    allowNull: true // Speed in m/s or km/h (optional)
  },
  battery: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 100 // Battery percentage
    }
  }
}, {
  tableName: 'telemetries',       // Set fixed table name
  freezeTableName: true,          // Prevent Sequelize from pluralizing
  timestamps: true                // Adds createdAt and updatedAt
});

module.exports = Telemetry;
