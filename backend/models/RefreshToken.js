const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RefreshToken = sequelize.define('RefreshToken', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'refresh_tokens',
  freezeTableName: true,    // Prevent Sequelize from modifying table name
  timestamps: true
});

module.exports = RefreshToken;
