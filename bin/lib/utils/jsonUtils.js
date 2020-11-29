// JSON
const stripDoubleQuotes = (str) => {
    if (typeof str !== 'string') {
        console.error(`stripDoubleQuotes: The "str" argument must be of type 'string'. Received '${typeof str}'`);
        return '';
    }
    return str.replace(/\"/g, '');
};
const prettyPrint = (obj, numberOfTabs = 2) => JSON.stringify(obj, null, numberOfTabs);
const formatJSON = (json, pretty = true) => {
    const formattedJSON = json;
    if (typeof formattedJSON === 'object' && pretty)
        return stripDoubleQuotes(prettyPrint(json));
    else if (typeof formattedJSON === 'object')
        return stripDoubleQuotes(JSON.stringify(formattedJSON));
    else
        return stripDoubleQuotes(formattedJSON);
};

module.exports = {
    stripDoubleQuotes,
    prettyPrint,
    formatJSON
};
