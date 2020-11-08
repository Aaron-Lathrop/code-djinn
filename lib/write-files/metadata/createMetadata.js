const fs = require('fs');
const path = require('path');
const questions = require('../../questions/questions');
const { colors, logWithColor } = require('../../utils/consoleUtils');
const setup = require('../../setup');
const writeTemplateMetaDataJSONFile = require('./writeTemplateMetaDataJSONFile');

const createMetadata = async () => {
    const djinnConfigPath = path.join(process.cwd(), 'djinn.config.json');
    if (fs.existsSync(djinnConfigPath)) {
        const djinnConfig = require(djinnConfigPath);
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
    } else {
        logWithColor(colors.FgRed, `Not found: ${djinnConfigPath}`);
        logWithColor(colors.FgRed, `Try running 'djinn --init' first to create this file before continuing.`)
    }
}

module.exports = createMetadata;