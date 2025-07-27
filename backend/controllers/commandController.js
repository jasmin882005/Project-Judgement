const { Command } = require("../models");
const { logEvent } = require("../utils/logger"); // Centralized logger

// Send a command to a drone
// Route: POST /api/commands
exports.sendCommand = async (req, res) => {
  try {
    const { droneId, command } = req.body;

    // Only allow predefined command types
    if (!["abort", "reroute", "return"].includes(command)) {
      return res.status(400).json({ error: "Invalid command type" });
    }

    // Create new command with default status "pending"
    const newCommand = await Command.create({
      droneId,
      command,
      status: "pending",
    });

    // Log success
    await logEvent({
      action: "COMMAND_SENT",
      event: `Command "${command}" sent to drone ${droneId}`,
      createdBy: req.user?.email || "system",
      type: "info",
      source: "commandController",
    });

    res.status(201).json(newCommand);
  } catch (err) {
    // Log failure
    await logEvent({
      action: "COMMAND_FAILED",
      event: "Error sending command",
      createdBy: req.user?.email || "system",
      type: "error",
      source: "commandController",
    });

    res.status(500).json({ error: "Failed to send command" });
  }
};

// Get all commands sent to a specific drone
// Route: GET /api/commands/:droneId
exports.getCommandsByDrone = async (req, res) => {
  try {
    const { droneId } = req.params;

    const commands = await Command.findAll({
      where: { droneId },
      order: [['createdAt', 'DESC']],
    });

    // No commands found
    if (!commands.length) {
      await logEvent({
        action: "NO_COMMANDS",
        event: `No commands found for drone ${droneId}`,
        type: "warning",
        source: "commandController",
      });
      return res.status(404).json({ error: "No commands found for this drone" });
    }

    res.json(commands);
  } catch (err) {
    await logEvent({
      action: "COMMAND_FETCH_FAILED",
      event: "Error retrieving commands",
      createdBy: req.user?.email || "system",
      type: "error",
      source: "commandController",
    });

    res.status(500).json({ error: "Failed to fetch commands" });
  }
};
