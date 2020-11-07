const { colors, logWithColor } = require('../consoleUtils');

const getProcessFlags = () => {
    const flagModel = (flag, argument) => ({ flag, argument });
    
    const argv = process.argv.slice(2);
    const processFlags = argv.reduce((environmentFlags, flag, i) => {
        const nextFlag = argv[i + 1];
        const argument = nextFlag && (!nextFlag.includes('-')) ? nextFlag : '';

        if (flag.includes('--')) {
            if (!environmentFlags.longFlag) environmentFlags.longFlag = flagModel(flag, argument);
            else {
                logWithColor(colors.FgMagenta, `Flag '${flag}' ignored, only one '--' flag is permitted per command.`);
            }
        } else if (flag.includes('-')) {
            environmentFlags.shortFlags.push(flagModel(flag, argument));
        }
        return environmentFlags;
    }, { longFlag: null, shortFlags: [] });

    return processFlags;
};

module.exports = getProcessFlags;
