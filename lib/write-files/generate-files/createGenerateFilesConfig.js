const fs = require('fs');
const path = require('path');
const questions = require('../../questions/questions');
const { colors, logWithColor } = require('../../utils/consoleUtils');
const writeGenerateFilesConfigJSONFile = require('./writeGenerateFilesConfigJSONFile');

const createGenerateFilesConfig = async () => {
    const djinnConfigPath = path.join(process.cwd(), 'djinn.config.json');
    if (fs.existsSync(djinnConfigPath)) {
        const djinnConfig = require(djinnConfigPath);
        const { configFileName, metaDataFileName } = djinnConfig;
        const configFilePath = path.join(process.cwd(), configFileName);
        const configFileExists = fs.existsSync(configFilePath);
        if (configFileExists) {
            logWithColor(colors.FgCyan, `\n${configFileName} already exists at ${configFilePath}\n`)
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
    } else {
        logWithColor(colors.FgRed, `Not found: ${djinnConfigPath}`);
        logWithColor(colors.FgRed, `Try running 'djinn --init' first to create this file before continuing.`)
    }
};

module.exports = createGenerateFilesConfig;
