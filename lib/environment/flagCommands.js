const command = require('../environment/commands/allCommands');
const package = require('../../package.json');
const { updateDjinnEnv } = require('../store/djinnEnvStore');

const version = package => console.log(`${package.name} v${package.version}`);

const flagHelp = {

};
const help = () => null;

const flagCommands = {
    "--dryrun": () => updateDjinnEnv({ dryrun: true }),

    "-i": () => command.init(),
    "--init": () => command.init(),

    "-g": () => command.generate(),
    "--generate": () => command.generate(),

    "--update-filesconfig": () => command.updateGenerateFilesConfig(),

    "--update-metadata": () => command.updateMetadata(),

    "-v": () => version(package),
    "--version": () => version(package),

    "-h": () => help(),
    "--help": () => help(),
    '': () => null
};

const executeCommand = async (command,...args) => {
    if (flagCommands[command]) {
        return await flagCommands[command](...args)
    } else {
        console.log(`Command ${command} not recognized.`);
    }
};

module.exports = {
    flagCommands,
    executeCommand
};
