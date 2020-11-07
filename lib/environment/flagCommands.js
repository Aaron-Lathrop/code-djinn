const init = require('../environment/initCommand');
const package = require('../../package.json');
const { updateDjinnEnv } = require('../store/djinnEnvStore');

const version = package => console.log(`${package.name} v${package.version}`);

const flagHelp = {

};
const help = () => null;

const flagCommands = () => ({
    "--dryrun": () => updateDjinnEnv({ dryrun: true }),
    "-i": () => init(),
    "--init": () => init(),
    "-v": () => version(package),
    "--version": () => version(package),
    "-h": () => help(),
    '': () => null
});

const executeCommand = async (command,...args) => {
    if (flagCommands()[command]) {
        await flagCommands()[command](...args)
    } else {
        console.log(`Command ${command} not recognized.`);
    }
};

module.exports = {
    flagCommands,
    executeCommand
};
