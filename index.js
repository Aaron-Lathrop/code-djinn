const { generatefiles } = require("./generatefiles");
const { setup } = require('./setup');
const { writeTemplateMetaDataJSONFile } = require('./setup');
const readline = require('readline');
const { colors, logWithColor } = require('./utils/consoleUtils');
const { writeApiConfigJSONFile } = require("./writeFiles/writeApiConfigJSONFile");
const { rejects } = require("assert");

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

const routesQuestion = () => new Promise((resolve, reject) => {
    try {
        rl.question('What routes will your api have? (example input - "pokemon, type, ability"): ', (answer = '') => {
            console.log(`\nThank you, creating json file for you to complete with inputs for each of these routes: ${answer}.`);
            const routes = answer.split(',').map(route => route.replace(',', '').trim());
            resolve(routes);
        });
    } catch (err) {
        reject(err);
    }
});

const main = async () => {
    logWithColor(colors.FgCyan, 'Initizaling code-djinn setup...\n');
    //generatefiles();
    const templateMetaData = setup('templates', 'temp');
    const metaDataFilePath = writeTemplateMetaDataJSONFile(templateMetaData);
    console.log('\n');
    const routes = await routesQuestion();
    const apiConfigFilePath = writeApiConfigJSONFile(routes);
    closeReader();

    logWithColor(colors.FgGreen, '\nThanks for using code-djinn to start your api!');
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