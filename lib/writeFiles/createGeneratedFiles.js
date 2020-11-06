const path = require('path');
const questions = require('../questions/questions');
const writeGeneratedFiles = require('./writeGeneratedFiles');

const createGeneratedFiles = async (djinnConfig, metaDataFilePath, configFilePath) => {
    const { metaDataFileName, configFileName, generateFilesDirectory } = djinnConfig;
    const rewriteGeneratedFiles = await questions.generateFilesQuestion(metaDataFileName, configFileName, path.join(process.cwd(), generateFilesDirectory));
    if (rewriteGeneratedFiles) writeGeneratedFiles(metaDataFilePath, configFilePath);
};

module.exports = createGeneratedFiles;