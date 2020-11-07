const package = require('../../../package.json');
const { updateDjinnEnv } = require('../../store/djinnEnvStore');

const version = package => console.log(`${package.name} v${package.version}`);

const flagHelp = {

};
const help = () => null;

const flagCommands = () => ({
    "--dryrun": () => updateDjinnEnv({ dryrun: true }),
    "-v": () => version(package),
    "--version": () => version(package),
    "-h": () => help(),
    '': () => null
});

const executeCommand = (command,...args) => {
    if (flagCommands()[command]) {
        flagCommands()[command](...args)
    } else {
        console.log(`Command ${command} not recognized.`);
    }
};

module.exports = {
    flagCommands,
    executeCommand
};
