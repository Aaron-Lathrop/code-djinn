const fs = require('fs');
const path = require('path');
const questions = require('../questions/questions');
const { colors, logWithColor } = require('../utils/consoleUtils');
const { prettyPrintJSON } = require('../utils/utils');

const createDjinnConfig = async () => {
    const djinnConfigFileName = 'djinn.config.json';
    const djinnConfigFilePath = path.join(process.cwd(), djinnConfigFileName);
    const configFileExists = fs.existsSync(djinnConfigFilePath);
    if (configFileExists) {
        logWithColor(colors.FgYellow, 'djinn.config.json exists');
    } else {
        logWithColor(colors.FgYellow, `${djinnConfigFileName} does not exist`);
        logWithColor(colors.FgYellow, `Creating ${djinnConfigFileName} file.`);
        const templatesDirectory = await questions.templateFolderQuestion();
        const generateFilesDirectory = await questions.generateFilesFolderQuestion();
        const metaDataFileName = await questions.metaDataFileNameQuestion();
        const configFileName = await questions.configFileNameQuestion();
        const djinConfigData = prettyPrintJSON({
            templatesDirectory,
            generateFilesDirectory,
            metaDataFileName,
            configFileName
        });
        fs.writeFileSync(djinnConfigFilePath, djinConfigData, (err) => { if (err) throw err; });
        logWithColor(colors.FgCyan, `Created djinn.config.json file at ${djinnConfigFilePath}`);
    }

    return djinnConfigFilePath;
};

module.exports = createDjinnConfig;