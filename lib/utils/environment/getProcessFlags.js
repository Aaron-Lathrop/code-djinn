const { colors, logWithColor } = require('../consoleUtils');

const getProcessFlags = () => {
    const processFlags = process.argv.slice(2);
    const formattedProcessFlags = processFlags.reduce((flagObject, currentFlag) => { 
        if (currentFlag.includes('--')) {
            if (!flagObject.longFlag) flagObject.longFlag = currentFlag;
            else {
                logWithColor(colors.FgMagenta, `Flag '${currentFlag}' ignored, only one '--' flag is permitted per command.`);
            }
        } else if (currentFlag.includes('-')) {
            flagObject.shortFlags.push(currentFlag);
        }
        return flagObject;
    }, { longFlag: '', shortFlags: [] });

    return formattedProcessFlags;
};

module.exports = getProcessFlags;
