const path = require('path');

function getConfig(processVariables) {
    const configs = require(path.join(__dirname, `/${processVariables.config}`)) || [];
    return configs;
}
exports.getConfig = getConfig;
