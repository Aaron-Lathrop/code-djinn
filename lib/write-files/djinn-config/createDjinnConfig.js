const fs = require('fs');
const path = require('path');
const questions = require('../../questions/questions');
const { colors, logWithColor } = require('../../utils/consoleUtils');
const writeDjinnConfigJSONFile = require('./writeDjinnConfigJSONFile');

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
        const djinnConfigData = {
            templatesDirectory,
            generateFilesDirectory,
            metaDataFileName,
            configFileName
        };
        writeDjinnConfigJSONFile(djinnConfigFilePath, djinnConfigData);
    }

    return djinnConfigFilePath;
};

module.exports = createDjinnConfig;