#!/usr/bin/env node

const { colors, logWithColor } = require('./lib/utils/consoleUtils');
const questionUtils = require('./lib/questions/questionUtils');
const { executeCommand } = require('./lib/utils/environment/flagCommands');
const getProcessFlags = require('./lib/utils/environment/getProcessFlags');

const createDjinnConfig = require('./lib/write-files/djinn-config/createDjinnConfig');
const createMetadata = require('./lib/write-files/metadata/createMetadata');
const createGenerateFilesConfig = require('./lib/write-files/generate-files/createGenerateFilesConfig');
const createGeneratedFiles = require('./lib/write-files/generate-files/createGeneratedFiles');

const { getDjinnEnv } = require('./lib/store/djinnEnvStore');

const main = async () => {
    try {
        const processFlags = getProcessFlags();
        const { longFlag, shortFlags } = processFlags;
        executeCommand(longFlag.flag, longFlag.argument);
        shortFlags.forEach(f => executeCommand(f.flag, f.argument));

        logWithColor(colors.FgGreen + colors.Underscore, 'Initizaling code-djinn setup...');

        // djinn.config.json
        const djinnConfigFilePath = await createDjinnConfig();
        const djinnConfig = require(djinnConfigFilePath);

        // template-metadata.json
        const metaDataFilePath = await createMetadata(djinnConfig);
        
        // generate-files-config.json
        const configFilePath = await createGenerateFilesConfig(djinnConfig);

        // Output generated files
        await createGeneratedFiles(djinnConfig, metaDataFilePath, configFilePath)

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