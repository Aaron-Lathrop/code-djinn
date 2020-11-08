const fs = require('fs');
const path = require('path');
const { deepCopyObject, prettyPrintJSON } = require('../../utils/utils')
const { colors, logWithColor } = require('../../utils/consoleUtils');

const writeGenerateFilesConfigJSONFile = (metaDataFileName, configFileName, typeOfThing, types) => {
    // Build object to convert to JSON
    const templateMetaData = require(path.join(process.cwd(), metaDataFileName)) || [];
    const allTemplateParams = templateMetaData.map(template => template.params).reduce((acc, current) => {
        Object.keys(current).forEach(key =>{ if (typeof acc[key] === 'undefined') acc[key] = "" })
        return acc;
    }, {});
    const templates = templateMetaData.map(template => template.templateFileName);

    const jsonTypes = {};
    types.forEach(type => {
        const params = deepCopyObject(allTemplateParams);
        if (typeof allTemplateParams[typeOfThing] !== 'undefined') {
            params[typeOfThing] = type;
        }
        jsonTypes[type] = {
            templates,
            params
        }
    });

    // Write file to disk
    const filePath = path.join(process.cwd(), configFileName);
    fs.writeFileSync(filePath, prettyPrintJSON({ [typeOfThing]: jsonTypes }), (err) => {
        if (err) throw err;
    });
    logWithColor(colors.FgCyan, `\nCreated ${configFileName} at ${filePath}`)

    return filePath;
}
module.exports = writeGenerateFilesConfigJSONFile;
