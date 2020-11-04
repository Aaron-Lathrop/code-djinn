const fs = require('fs');
const path = require('path');
const { deepCopyObject, prettyPrintJSON } = require('../utils/utils')
const { colors, logWithColor } = require('../utils/consoleUtils');

function writeApiConfigJSONFile(routes) {
    // Build object to convert to JSON
    const templateMetaData = require('../templateMetaData.json') || [];
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
    const filePath = path.join(process.cwd(), 'apiConfig.json');
    fs.writeFileSync(filePath, prettyPrintJSON({ routes: jsonRoutes }), (err) => {
        if (err) throw err;
    });
    logWithColor(colors.FgCyan, `\nCreated api configuration file at ${filePath}`)

    return filePath;
}
exports.writeApiConfigJSONFile = writeApiConfigJSONFile;
