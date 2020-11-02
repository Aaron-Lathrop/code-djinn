const { generatefiles } = require("./generatefiles");
const { setup } = require('./setup');
const { writeTemplateMetaDataJSONFile } = require('./setup');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//generatefiles();
const templateMetaData = setup('templates', 'temp');
const metaDataFilePath = writeTemplateMetaDataJSONFile(templateMetaData);

rl.question('What routes will your api have? (example input - "pokemon, type, ability"): ', (answer) => {
    console.log(`Thank you, creating json file for you to complete with inputs for each of these routes: ${answer}.`);
    rl.close();
});

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