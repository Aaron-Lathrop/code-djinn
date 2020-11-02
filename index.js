const { generatefiles } = require("./generatefiles");
const { setup } = require('./setup');
const { writeTemplateMetaDataJSONFile } = require('./setup');
const readline = require('readline');
const { colors } = require('./consoleColors');

// Questions
// https://nodejs.org/api/readline.html
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const logWithColor = (color, message) => console.log(`${color}%s\x1b[0m`, message);
const routesQuestion = () => new Promise((resolve, reject) => {
    rl.question('What routes will your api have? (example input - "pokemon, type, ability"): ', (answer = '') => {
        console.log(`Thank you, creating json file for you to complete with inputs for each of these routes: ${answer}.`);
        // Add logic to write the json file
        const routes = answer.split(',').map(route => route.replace(',', '').trim());
        console.log(routes);
        // console.log to tell user where the json file is
        resolve();
    });
});

const main = async () => {
    const closeReader = () => {
        rl.close();
        rl.removeAllListeners();
    }

    logWithColor(colors.FgCyan, 'Initizaling code-djinn setup...\n');
    //generatefiles();
    const templateMetaData = setup('templates', 'temp');
    const metaDataFilePath = writeTemplateMetaDataJSONFile(templateMetaData);

    console.log('\n');
    await routesQuestion();
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