const path = require('path');

const { colors, logWithColor } = require('./lib/utils/consoleUtils');

const createDjinnConfig = require('./lib/writeFiles/createDjinnConfig');
const createMetadata = require('./lib/writeFiles/createMetadata');
const createGenerateFilesConfig = require('./lib/writeFiles/createGenerateFilesConfig');
const { generateFiles } = require("./lib/writeFiles/generateFiles");

const questions = require('./lib/questions/questions');
const questionUtils = require('./lib/questions/questionUtils');

const main = async () => {
    try {
        logWithColor(colors.FgGreen + colors.Underscore, 'Initizaling code-djinn setup...');

        // djinn.config.json
        const djinnConfigFilePath = await createDjinnConfig();
        const djinnConfig = require(djinnConfigFilePath);

        const {
            generateFilesDirectory,
            metaDataFileName,
            configFileName
        } = djinnConfig;

        // template-metadata.json
        const metaDataFilePath = await createMetadata(djinnConfig);
        
        // generate-files-config.json
        const configFilePath = await createGenerateFilesConfig(djinnConfig);

        // Output generated files
        const rewriteGeneratedFiles = await questions.generateFilesQuestion(metaDataFileName, configFileName, path.join(process.cwd(), generateFilesDirectory));
        if (rewriteGeneratedFiles) generateFiles(metaDataFilePath, configFilePath);

    } catch (err) {
        throw err;
    } finally {
        questionUtils.closeReader();
        logWithColor(colors.FgGreen, '\nThanks for using code-djinn to start your project!');
    }
};
main();

/**
 * Need a function where I can just pass a list of route names and be give a JSON file
 * that I need to fill out so I can properly generate the files from the templates.
 * 
 * The goal is it make it so the user just provides the folder structure, templates,
 * and the routes they would like, and code-djinn just tells the user what it needs
 * to generate the files.
 * 
 * It could be ideal to have a CLI that asks the user for all the data it needs, but
 * this is not a "must-have" for v1.0.0
 */