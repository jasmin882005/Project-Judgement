const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Define Command model — stores drone command instructions and status
const Command = sequelize.define("Command", {
  droneId: {
    type: DataTypes.STRING,
    allowNull: false,   // Drone receiving the command
  },
  command: {
    type: DataTypes.ENUM("abort", "reroute", "return", "move", "takeoff", "land"),
    allowNull: false,  // Type of command issued
  },
  status: {
    type: DataTypes.ENUM("pending", "executed", "failed"),
    allowNull: false,
    defaultValue: "pending",
  }
}, {
  tableName: "commands",   // Fix table name
  freezeTableName: true,    // Disable pluralization
  timestamps: true         // Adds createdAt, updatedAt
});

module.exports = Command;
