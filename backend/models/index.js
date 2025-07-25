// models/index.js

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Load models
db.User = require('./User');
db.RefreshToken = require('./RefreshToken');
db.Mission = require('./Mission');
db.Telemetry = require('./Telemetry');
db.Alert = require('./Alert');
db.Command = require('./Command');
db.Log = require('./Log');
db.Drone = require('./Drone');

// Define associations (optional but helpful)
db.User.hasMany(db.RefreshToken, { foreignKey: 'userId', onDelete: 'CASCADE' });
db.RefreshToken.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db;
