const fs = require('fs');
const path = require('path');

const { setup } = require('./setup');
const { prettyPrintJSON } = require('./utils/utils');
const { colors, logWithColor } = require('./utils/consoleUtils');

const { writeTemplateMetaDataJSONFile } = require('./writeFiles/writeTemplateMetaDataJSONFile');
const { writeGenerateFilesConfigJSONFile } = require('./writeFiles/writeGenerateFilesConfigJSONFile');
const { generateFiles } = require("./writeFiles/generateFiles");

const questions = require('./questions/questions');
const questionUtils = require('./questions/questionUtils');

const main = async () => {
    try {
        logWithColor(colors.FgGreen + colors.Underscore, 'Initizaling code-djinn setup...');

        // djinn.config.json file
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