const fs = require('fs');
const path = require('path');
const questions = require('../../questions/questions');
const writeGeneratedFiles = require('./writeGeneratedFiles');

const createGeneratedFiles = async () => {
    if (fs.existsSync(path.join(process.cwd(), 'djinn.config.json'))) {
        const djinnConfig = require(path.join(process.cwd(), 'djinn.config.json'));
        const { metaDataFileName, configFileName, generateFilesDirectory } = djinnConfig;
        const metaDataFilePath = path.join(process.cwd(), metaDataFileName);
        const configFilePath = path.join(process.cwd(), configFileName);
        const rewriteGeneratedFiles = await questions.generateFilesQuestion(metaDataFileName, configFileName, path.join(process.cwd(), generateFilesDirectory));
        if (rewriteGeneratedFiles) writeGeneratedFiles(metaDataFilePath, configFilePath);
    } else {
        console.log(`Not found: ${path.join(process.cwd(), 'djinn.config.json')}`);
        console.log("Try running 'djinn --init' first to create this file before continuing.");
    }
};

module.exports = createGeneratedFiles;