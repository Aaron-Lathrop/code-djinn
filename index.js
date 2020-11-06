const fs = require('fs');
const path = require('path');

const { setup } = require('./lib/setup');
const { colors, logWithColor } = require('./lib/utils/consoleUtils');

const createDjinnConfig = require('./lib/writeFiles/createDjinnConfig');
const { writeTemplateMetaDataJSONFile } = require('./lib/writeFiles/writeTemplateMetaDataJSONFile');
const { writeGenerateFilesConfigJSONFile } = require('./lib/writeFiles/writeGenerateFilesConfigJSONFile');
const { generateFiles } = require("./lib/writeFiles/generateFiles");

const questions = require('./lib/questions/questions');
const questionUtils = require('./lib/questions/questionUtils');

const main = async () => {
    try {
        logWithColor(colors.FgGreen + colors.Underscore, 'Initizaling code-djinn setup...');

        const djinnConfigFilePath = await createDjinnConfig();
        const djinnConfig = require(djinnConfigFilePath);

        const templatesDirectory = djinnConfig.templatesDirectory;
        const fileGenerationDirectory = djinnConfig.generateFilesDirectory;
        
        // Meta-data
        const metaDataFileName = djinnConfig.metaDataFileName;
        let metaDataFilePath = path.join(process.cwd(), metaDataFileName);
        const metaDataExists = fs.existsSync(path.join(process.cwd(), metaDataFilePath));
        if (metaDataExists) {
            logWithColor(colors.FgCyan, `\ntemplate-metadata.json already exists at ${metaDataFilePath}\n`);
            const rewriteMetaData = await questions.rewriteFileQuestion(metaDataFileName);
            if (rewriteMetaData) {
                const templateMetaData = setup(templatesDirectory, fileGenerationDirectory);
                writeTemplateMetaDataJSONFile(metaDataFilePath, templateMetaData);
            }
        } else {
            const templateMetaData = setup(templatesDirectory, fileGenerationDirectory);
            writeTemplateMetaDataJSONFile(metaDataFilePath, templateMetaData);
        }
        
        // Handle api-config.json file creation
        const apiConfigFileName = djinnConfig.configFileName;
        let apiConfigFilePath = path.join(process.cwd(), apiConfigFileName);
        const apiConfigExists = fs.existsSync(path.join(process.cwd(), apiConfigFilePath));
        if (apiConfigExists) {
            logWithColor(colors.FgCyan, `\napi-config.json already exists at ${apiConfigFilePath}\n`)
            const rewriteApiConfig = await questions.rewriteFileQuestion(apiConfigFileName);
            if (rewriteApiConfig) {
                const routes = await questions.routesQuestion();
                writeGenerateFilesConfigJSONFile(metaDataFileName, apiConfigFileName, routes);
            }
        } else {
            const routes = await questions.routesQuestion();
            writeGenerateFilesConfigJSONFile(metaDataFileName, apiConfigFileName, routes)
        }

        // Output generated files
        const rewriteGeneratedFiles = await questions.generateFilesQuestion(metaDataFileName, apiConfigFileName, path.join(process.cwd(), fileGenerationDirectory));
        if (rewriteGeneratedFiles) generateFiles(metaDataFilePath, apiConfigFilePath);

    } catch (err) {
        logWithColor(colors.FgRed, err);
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