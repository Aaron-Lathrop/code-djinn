const fs = require('fs');
const path = require('path');
const { deepCopyObject, prettyPrintJSON } = require('../utils/utils')
const { colors, logWithColor } = require('../utils/consoleUtils');

function writeGenerateFilesConfigJSONFile(metaDataFileName, configFileName, routes) {
    // Build object to convert to JSON
    const templateMetaData = require(path.join(process.cwd(), metaDataFileName)) || [];
    const allTemplateParams = templateMetaData.map(template => template.params).reduce((acc, current) => {
        Object.keys(current).forEach(key =>{ if (typeof acc[key] === 'undefined') acc[key] = "" })
        return acc;
    }, {});
    const templates = templateMetaData.map(template => template.templateFileName);

    const jsonRoutes = {};
    routes.forEach(route => {
        const params = deepCopyObject(allTemplateParams);
        if (typeof allTemplateParams['route'] !== 'undefined') {
            params['route'] = route;
        }
        jsonRoutes[route] = {
            templates,
            params
        }
    });

    // Write file to disk
    const filePath = path.join(process.cwd(), configFileName);
    fs.writeFileSync(filePath, prettyPrintJSON({ routes: jsonRoutes }), (err) => {
        if (err) throw err;
    });
    logWithColor(colors.FgCyan, `\nCreated ${configFileName} at ${filePath}`)

    return filePath;
}
exports.writeGenerateFilesConfigJSONFile = writeGenerateFilesConfigJSONFile;
