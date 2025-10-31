// cmd.js - Command handler module for WhatsApp bot integration

const commands = [];

function cmd(cmdInfo, handler) {
  commands.push({
    info: cmdInfo,
    handler: handler
  });
  console.log(`✅ Command registered: ${cmdInfo.name}`);
}

function getCommands() {
  return commands;
}

module.exports = { cmd, getCommands };
