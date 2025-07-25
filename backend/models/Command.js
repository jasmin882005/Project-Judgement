const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Command = sequelize.define("Command", {
  droneId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  command: {
    type: DataTypes.ENUM("abort", "reroute", "return", "move", "takeoff", "land"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "executed", "failed"),
    allowNull: false,
    defaultValue: "pending",
  }
}, {
  tableName: "commands",   // Fix table name
  timestamps: true         // Adds createdAt, updatedAt
});

module.exports = Command;
