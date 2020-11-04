const fs = require('fs');
const path = require('path');
const { colors, logWithColor } = require('../utils/consoleUtils');
const { replaceTemplateVars } = require('../utils/template/replaceTemplateVars');

function generatefiles(metaDataFilePath, apiConfigFilePath) {   
    /**
     * For each route in apiConfig.json, generate a file with the specified params
     * for each template in that route (found in the meta data file)
     */
    const metaData = require(metaDataFilePath);
    const apiConfig = require(apiConfigFilePath);

    const routes = apiConfig.routes;

    for (let route in routes) {
        const { templates, params } = routes[route];
        templates.forEach(template => {
            const metaDataTemplate = metaData.find(t => t.templateFileName === template);
            if (metaDataTemplate) {
                const { destinationPath, templateFullPath } = metaDataTemplate;
                const fileTemplate = fs.readFileSync(templateFullPath, 'utf-8') || '';
                const newFileString = replaceTemplateVars(fileTemplate, params);
                fs.writeFileSync(path.join(destinationPath, `${route}.js`), newFileString, (err) => {
                    if (err) throw err;
                });
                logWithColor(colors.FgCyan, `\nCreated api file at ${path.join(destinationPath, `${route}.js`)}`)
            }
            else {
                logWithColor(colors.FgRed, "Something went wrong getting the metaDataTemplate.")
            }
        })
    }
}
exports.generatefiles = generatefiles;