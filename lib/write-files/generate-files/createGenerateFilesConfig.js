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
            const rewriteConfig = await questions.rewriteFileQuestion(configFileName);
            if (rewriteConfig) {
                await writeFilesWorkFlow(metaDataFileName, configFileName);
            }
        } else {
            await writeFilesWorkFlow(metaDataFileName, configFileName);
        }

        return configFilePath;
    } else {
        logWithColor(colors.FgRed, `Not found: ${djinnConfigPath}`);
        logWithColor(colors.FgRed, `Try running 'djinn --init' first to create this file before continuing.`)
    }
};

module.exports = createGenerateFilesConfig;

const writeFilesWorkFlow = async (metaDataFileName, configFileName) => {
    const type = await questions.whichTypeQuestion();
    const types = await questions.typesQuestion(type);
    writeGenerateFilesConfigJSONFile(metaDataFileName, configFileName, type, types);
};
