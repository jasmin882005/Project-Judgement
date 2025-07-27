const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define RefreshToken model — stores persistent refresh tokens for users
const RefreshToken = sequelize.define('RefreshToken', {
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true // Each token must be unique
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false // Associated user ID
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false // When the token expires
  }
}, {
  tableName: 'refresh_tokens',   // Consistent table name
  freezeTableName: true,         // Prevent Sequelize from pluralizing
  timestamps: true               // Adds createdAt and updatedAt
});

module.exports = RefreshToken;
