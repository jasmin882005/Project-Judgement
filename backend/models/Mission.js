const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Mission = sequelize.define('Mission', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  objective: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'complete'),
    allowNull: false
  },
  assignedDrone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  waypoints: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'missions',
  timestamps: true
});

module.exports = Mission;
