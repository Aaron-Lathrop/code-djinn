const fs = require('fs');
const path = require('path');
const questions = require('../../questions/questions');
const { colors, logWithColor } = require('../../utils/consoleUtils');
const setup = require('../../setup');
const writeTemplateMetaDataJSONFile = require('./writeTemplateMetaDataJSONFile');

const createMetadata = async (djinnConfig) => {
    const { templatesDirectory, generateFilesDirectory, metaDataFileName } = djinnConfig;

    const metaDataFilePath = path.join(process.cwd(), metaDataFileName);
    const metaDataExists = fs.existsSync(path.join(process.cwd(), metaDataFilePath));
    if (metaDataExists) {
        logWithColor(colors.FgCyan, `\ntemplate-metadata.json already exists at ${metaDataFilePath}\n`);
        const rewriteMetaData = await questions.rewriteFileQuestion(metaDataFileName);
        if (rewriteMetaData) {
            const templateMetaData = setup(templatesDirectory, generateFilesDirectory);
            writeTemplateMetaDataJSONFile(metaDataFilePath, templateMetaData);
        }
    } else {
        const templateMetaData = setup(templatesDirectory, generateFilesDirectory);
        writeTemplateMetaDataJSONFile(metaDataFilePath, templateMetaData);
    }

    return metaDataFilePath;
}

module.exports = createMetadata;