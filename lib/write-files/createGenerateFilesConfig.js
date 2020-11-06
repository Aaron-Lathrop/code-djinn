const fs = require('fs');
const path = require('path');
const questions = require('../questions/questions');
const { colors, logWithColor } = require('../utils/consoleUtils');
const writeGenerateFilesConfigJSONFile = require('./writeGenerateFilesConfigJSONFile');

const createGenerateFilesConfig = async (djinnConfig) => {
    const { configFileName, metaDataFileName } = djinnConfig;
    const configFilePath = path.join(process.cwd(), configFileName);
    const configFileExists = fs.existsSync(path.join(process.cwd(), configFilePath));
    if (configFileExists) {
        logWithColor(colors.FgCyan, `\napi-config.json already exists at ${configFilePath}\n`)
        const rewriteApiConfig = await questions.rewriteFileQuestion(configFileName);
        if (rewriteApiConfig) {
            const routes = await questions.routesQuestion();
            writeGenerateFilesConfigJSONFile(metaDataFileName, configFileName, routes);
        }
    } else {
        const routes = await questions.routesQuestion();
        writeGenerateFilesConfigJSONFile(metaDataFileName, configFileName, routes)
    }

    return configFilePath;
};

module.exports = createGenerateFilesConfig;
