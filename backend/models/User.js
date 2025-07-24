// Import Sequelize data types
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // DB connection

// Define the User model (table: Users)
const User = sequelize.define('User', {
  // User's full name
  name: DataTypes.STRING,

  // User's email address (must be unique)
  email: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true,
  validate: {
    isEmail: true,
  }
},

  // Hashed password (never store plain text!)
  password: DataTypes.STRING,

  // Role of the user: either "admin" or "operator"
  role: DataTypes.STRING,
});

// Export the User model to use in authController and middleware
module.exports = User;
