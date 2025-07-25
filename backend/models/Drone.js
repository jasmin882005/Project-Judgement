const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Drone = sequelize.define('Drone', {
  droneId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  model: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'idle', 'offline'),
    allowNull: false
  },
  gps: {
    type: DataTypes.JSON,
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
  tableName: 'drones',
  timestamps: true
});

module.exports = Drone;
