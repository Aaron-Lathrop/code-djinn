#!/usr/bin/env node

const { colors, logWithColor } = require('./lib/utils/consoleUtils');
const questionUtils = require('./lib/questions/questionUtils');
const { executeCommand } = require('./lib/environment/flagCommands');
const getProcessFlags = require('./lib/environment/getProcessFlags');

const main = async () => {
    try {
        const processFlags = getProcessFlags();
        const { longFlag, shortFlags } = processFlags;
        await executeCommand(longFlag.flag, longFlag.argument);
        for (let i = 0; i < shortFlags.length; i++) {
            await executeCommand(shortFlags[i].flag, shortFlags[i].argument);
        }
    } catch (err) {
        throw err;
    } finally {
        questionUtils.closeReader();
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