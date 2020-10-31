function getConfig(processVariables) {
    const configs = require(__dirname + `/${processVariables.config}`) || [];
    return configs;
}
exports.getConfig = getConfig;
