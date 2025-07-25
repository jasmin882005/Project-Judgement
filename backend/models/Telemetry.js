const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Telemetry = sequelize.define('Telemetry', {
  droneId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gps: {
    type: DataTypes.JSON,
    allowNull: false
  },
  altitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  speed: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  battery: {
    type: DataTypes.INTEGER,
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  tableName: 'telemetries',
  timestamps: true
});

module.exports = Telemetry;
