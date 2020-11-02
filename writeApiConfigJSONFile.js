const fs = require('fs');
const path = require('path');
const { deepCopyObject, prettyPrintJSON } = require('./utils/utils')
const { colors, logWithColor } = require('./utils/consoleUtils');
const templateMetaData = require('./templateMetaData.json') || [];

function writeApiConfigJSONFile(routes) {
    logWithColor(colors.FgCyan, routes);
    // Build object to convert to JSON
    const allTemplateParams = templateMetaData.map(template => template.params).reduce((acc, current) => {
        Object.keys(current).forEach(key =>{ if (typeof acc[key] === 'undefined') acc[key] = "" })
        return acc;
    }, {});
    const templates = templateMetaData.map(template => template.templateFileName);

    const apiConfig = routes.map(route => {
        const params = deepCopyObject(allTemplateParams);
        if (typeof allTemplateParams['route'] !== 'undefined')
            params['route'] = route;
        return {
            route,
            templates,
            params
        };
    });

    // Write file to disk
    fs.writeFileSync(path.join(process.cwd(), 'apiConfig.json'), prettyPrintJSON(apiConfig), (err) => {
        if (err) throw err;
        logWithColor(colors.FgCyan, `Created api configuration file at ${path.join(process.cwd(), 'apiConfig.json')}`)
    });

    return apiConfig;
}
exports.writeApiConfigJSONFile = writeApiConfigJSONFile;
