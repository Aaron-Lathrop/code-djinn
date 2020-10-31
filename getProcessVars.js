function getProcessVars(process) {
    // Convert args from CLI call to a javaScript object
    const processVariables = {};
    const processArgs = process.argv && process.argv.slice(2) || [];
    processArgs.forEach((val) => {
        const keyValue = val && val.split('=');
        if (keyValue.length < 2)
            throw Error('Arguments must be passed in the form "variable=value"');
        const key = keyValue[0];
        const value = keyValue[1];
        processVariables[key] = value;
    });
    return processVariables;
}
exports.getProcessVars = getProcessVars;
