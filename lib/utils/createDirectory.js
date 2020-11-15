const fs = require('fs');
const { colors, logWithColor } = require('./consoleUtils');

function createDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        logWithColor(colors.FgCyan, `Created new directory at ${dir}`);
    }
}
exports.createDirectory = createDirectory;
