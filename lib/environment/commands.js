const command = require('./commands/allCommands');
const package = require('../../package.json');
const { updateDjinnEnv } = require('../store/djinnEnvStore');

const version = package => console.log(`${package.name} v${package.version}`);

const flagHelp = {
    "--cwd": `Returns the current working directory djinn is using.`,
    "--dryrun": `Lists files to be created in the console without writing them. Use with flag "-g" to generate the files.`,

    "-i": `Initializes the necessary configuration files based on the provided template directory.
     A template directory is necessary to properly use this flag.See also, "--init".`,
    "--init": `Initializes the necessary configuration files based on the provided template directory.
         A template directory is necessary to properly use this flag. See also, "-i".`,

    "-g": 'Uses configuration files generated in the "init" step to generate files from files in the templates directory. See also "--generate".',
    "--generate": 'Uses configuration files generated in the "init" step to generate files from files in the templates directory. See also "-g".',

    "--update-filesconfig": 'Updates the generate-files-config.json file based on updates the user may have manually added in the template-metadata.json file.',

    "--update-metadata": `Updates the template-metadata.json file based on updates to files in the templates directory.
                    You'll be given the chance to update the generate-files-config.json file automatically when using this flag.`,

    "-v": 'Prints the current version of the installed code-djinn package. See also "--version".',
    "--version": 'Prints the current version of the installed code-djinn package. See also "-v".',

    "-h": 'Opens the help menu. See also "--help".',
    "--help": 'Opens the help menu. See also "-h".',
};
const help = () => { 
    const flags = Object.keys(flagHelp).sort();
    console.log(`Below are the available options that can be used with the "djinn" command:\n`)
    flags.forEach(flag => console.log(`${flag}:  ${flagHelp[flag]}`));
};

const flagCommands = {
    "--cwd": () => command.cwd(),
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
