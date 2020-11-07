const getProcessFlags = () => {
    const processFlags = process.argv.slice(2);
    const formattedProcessFlags = processFlags.reduce((flagObject, currentFlag) => { 
        if (currentFlag.includes('--')) {
            if (!flagObject.longFlag) flagObject.longFlag = currentFlag.replace('--', '');
            else throw "Cannot add more than 1 flag with '--'";
        } else if (currentFlag.includes('-')) {
            flagObject.shortFlags.push(currentFlag.replace('-', ''));
        }
        return flagObject;
    }, { longFlag: '', shortFlags: [] });

    return formattedProcessFlags;
};

module.exports = getProcessFlags;
