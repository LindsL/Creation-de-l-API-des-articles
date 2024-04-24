const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'logs', 'err.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}]\n ${message}\n`;
  fs.appendFileSync(logFilePath, logMessage, { encoding: 'utf-8' });
}

module.exports = { log };
