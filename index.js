const { setup } = require('./setup');
const readline = require('readline');
const { colors, logWithColor } = require('./utils/consoleUtils');
const { writeApiConfigJSONFile } = require('./writeFiles/writeApiConfigJSONFile');
const { writeTemplateMetaDataJSONFile } = require('./writeFiles/writeTemplateMetaDataJSONFile');
const { generatefiles } = require("./writeFiles/generatefiles");
const fs = require('fs');
const path = require('path');

// Questions
// https://nodejs.org/api/readline.html
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const closeReader = () => {
    rl.close();
    rl.removeAllListeners();
};

const answerYorN = (resolve, answer, tryAgainCallback, ...callbackArgs) => {
    const response = answer.toLowerCase();
    switch (response) {
        case 'y':
            resolve(true);
            break;
        case 'n':
            resolve(false);
            break;
        default:
            console.log('Invalid input, please select "y" or "n".\n');
            resolve(tryAgainCallback(...callbackArgs));
            break;
    }
}

const questionYorN = (question, tryAgainCallback, ...callbackArgs) => new Promise((resolve, reject) => {
    try {
        rl.question(question + " (Y/n): ", (answer = 'Y') => {
            answerYorN(resolve, answer, tryAgainCallback, ...callbackArgs);
        });
    } catch (err) {
        reject(err);
    }
});

const rewriteFileQuestion = (fileName) => questionYorN(`Rewrite ${fileName}?`, rewriteFileQuestion, fileName);
const generateFilesQuestion = (metaDataFileName, configFileName, generationPath) =>
    questionYorN(`Generate files from "${metaDataFileName}" and "${configFileName} to path ${generationPath}?"`, generateFilesQuestion, metaDataFileName, configFileName);

const routesQuestion = () => new Promise((resolve, reject) => {
    try {
        rl.question('\nWhat routes will your api have? (example input - "pokemon, type, ability"): ', (answer = '') => {
            console.log(`\nThank you, creating json file for you to complete with inputs for each of these routes:\n[${answer}]`);
            const routes = answer.split(',').map(route => route.replace(',', '').trim());
            resolve(routes);
        });
    } catch (err) {
        reject(err);
    }
});

const main = async () => {
    try {
        logWithColor(colors.FgGreen + colors.Underscore, 'Initizaling code-djinn setup...');
        const fileGenerationDirectory = 'temp';
        const templatesDirectory = 'templates';
        // Meta-data
        const metaDataFileName = 'template-metadata.json'
        let metaDataFilePath = path.join(process.cwd(), metaDataFileName);
        const metaDataExists = fs.existsSync(metaDataFilePath);
        if (metaDataExists) {
            logWithColor(colors.FgCyan, `\ntemplate-metadata.json already exists at ${metaDataFilePath}\n`);
            const rewriteMetaData = await rewriteFileQuestion(metaDataFileName);
            if (rewriteMetaData) {
                const templateMetaData = setup(templatesDirectory, fileGenerationDirectory);
                writeTemplateMetaDataJSONFile(metaDataFilePath, templateMetaData);
            }
        } else {
            const templateMetaData = setup(templatesDirectory, fileGenerationDirectory);
            writeTemplateMetaDataJSONFile(metaDataFilePath, templateMetaData);
        }
        
        // Handle api-config.json file creation
        const apiConfigFileName = 'api-config.json';
        let apiConfigFilePath = path.join(process.cwd(), apiConfigFileName);
        const configExists = fs.existsSync(apiConfigFilePath);
        if (configExists) {
            logWithColor(colors.FgCyan, `\napi-config.json already exists at ${apiConfigFilePath}\n`)
            const rewriteApiConfig = await rewriteFileQuestion(apiConfigFileName);
            if (rewriteApiConfig) {
                const routes = await routesQuestion();
                writeApiConfigJSONFile(routes);
            }
        } else {
            const routes = await routesQuestion();
            writeApiConfigJSONFile(routes)
        }

        // Output generated files
        const rewriteGeneratedFiles = await generateFilesQuestion(metaDataFileName, apiConfigFileName, path.join(process.cwd(), fileGenerationDirectory));
        if (rewriteGeneratedFiles) generatefiles(metaDataFilePath, apiConfigFilePath);

    } catch (err) {
        logWithColor(colors.FgRed, err);
    } finally {
        closeReader();
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