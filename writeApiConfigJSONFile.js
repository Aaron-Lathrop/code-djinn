const { colors, logWithColor } = require('./utils/consoleUtils');

function writeApiConfigJSONFile(routes) {
    logWithColor(colors.FgCyan, routes);
    return routes;
}
exports.writeApiConfigJSONFile = writeApiConfigJSONFile;
