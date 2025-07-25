const { Command } = require("../models");
const { logEvent } = require("../utils/logger"); // Reusable logging helper

// POST /api/commands → Send command to drone
exports.sendCommand = async (req, res) => {
  try {
    const { droneId, command } = req.body;

    // Validate command type
    if (!["abort", "reroute", "return"].includes(command)) {
      return res.status(400).json({ error: "Invalid command type" });
    }

    // Create command in DB
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
    // ❌ Log failure
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

// GET /api/commands/:droneId → Fetch all commands for a specific drone
exports.getCommandsByDrone = async (req, res) => {
  try {
    const { droneId } = req.params;

    const commands = await Command.findAll({
      where: { droneId },
      order: [['createdAt', 'DESC']],
    });

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
