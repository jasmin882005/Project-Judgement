const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define User model — stores user credentials and roles
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false // User's full name
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensures no duplicate accounts
    validate: {
      isEmail: true // Must be a valid email format
    }
  },

  password: {
    type: DataTypes.STRING,
    allowNull: false // Hashed password
  },

  role: {
    type: DataTypes.ENUM('admin', 'operator'),
    allowNull: false // Controls access level across the system
  }
}, {
  tableName: 'users',             // Explicit table name
  freezeTableName: true,          // Prevent Sequelize from auto-pluralizing
  timestamps: true                // Adds createdAt and updatedAt fields
});

module.exports = User;
