const { setup } = require('./setup');
const readline = require('readline');
const { colors, logWithColor } = require('./utils/consoleUtils');
const { writeGenerateFilesConfigJSONFile } = require('./writeFiles/writeGenerateFilesConfigJSONFile');
const { writeTemplateMetaDataJSONFile } = require('./writeFiles/writeTemplateMetaDataJSONFile');
const { generateFiles } = require("./writeFiles/generateFiles");
const fs = require('fs');
const path = require('path');
const { prettyPrintJSON } = require('./utils/utils');

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

// Questions
const question = (question, callback, ...args) => new Promise((resolve, reject) => {
    try {
        rl.question(question, (answer) => resolve(callback(answer, ...args)))
    } catch (err) {
        reject(err);
    }
});
// Yes/No Questions
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
    questionYorN(`Generate files from "${metaDataFileName}" and "${configFileName}" to path ${generationPath}?`, generateFilesQuestion, metaDataFileName, configFileName);

// djinn config questions
const formatDirectoryAnswer = (answer = '') => answer.replace('\\', '').replace('/', '');
const formatJsonFileName = (answer = '') => answer.replace(/\.\w*/gi, '') + '.json';

const templateFolderQuestion = () => question('Template folder name (/templates): ', answer => formatDirectoryAnswer(answer));
const generateFilesFolderQuestion = () => question('Path to generate files to (/src): ', answer => formatDirectoryAnswer(answer));
const metaDataFileNameQuestion = () => question('Template metadata config file name (template-metadata): ', answer => formatJsonFileName(answer));
const configFileNameQuestion = () => question('Generate files config file name (generate-files-config): ', answer => formatJsonFileName(answer));

// generate files questions
const routesQuestion = () => question('\nWhat routes will your api have? (example input - "pokemon, type, ability"): ', (answer = '') => {
            console.log(`\nCreating json file for you to complete with inputs for each of these routes:\n[${answer}]`);
            return answer.split(',').map(route => route.replace(',', '').trim());
        });

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
            const templatesDirectory = await templateFolderQuestion();
            const generateFilesDirectory = await generateFilesFolderQuestion();
            const metaDataFileName = await metaDataFileNameQuestion();
            const configFileName = await configFileNameQuestion();
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
        const apiConfigFileName = djinnConfig.configFileName;
        let apiConfigFilePath = path.join(process.cwd(), apiConfigFileName);
        const apiConfigExists = fs.existsSync(path.join(process.cwd(), apiConfigFilePath));
        if (apiConfigExists) {
            logWithColor(colors.FgCyan, `\napi-config.json already exists at ${apiConfigFilePath}\n`)
            const rewriteApiConfig = await rewriteFileQuestion(apiConfigFileName);
            if (rewriteApiConfig) {
                const routes = await routesQuestion();
                writeGenerateFilesConfigJSONFile(metaDataFileName, apiConfigFileName, routes);
            }
        } else {
            const routes = await routesQuestion();
            writeGenerateFilesConfigJSONFile(metaDataFileName, apiConfigFileName, routes)
        }

        // Output generated files
        const rewriteGeneratedFiles = await generateFilesQuestion(metaDataFileName, apiConfigFileName, path.join(process.cwd(), fileGenerationDirectory));
        if (rewriteGeneratedFiles) generateFiles(metaDataFilePath, apiConfigFilePath);

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