const fs = require('fs');
const path = require('path');
const { colors, logWithColor } = require('../../utils/consoleUtils');
const { replaceTemplateVars } = require('../../utils/template/replaceTemplateVars');

const writeGeneratedFiles = (metaDataFilePath, configFilePath) => {   
    /**
     * For each route in api-config.json, generate a file with the specified params
     * for each template in that route (found in the meta data file)
     */
    const metaData = require(metaDataFilePath);
    const config = require(configFilePath);

    const routes = config.routes;

    for (let route in routes) {
        const { templates, params } = routes[route];
        templates.forEach(template => {
            const metaDataTemplate = metaData.find(t => t.templateFileName === template);
            if (metaDataTemplate) {
                const { destinationPath, templateFullPath } = metaDataTemplate;
                const fileTemplate = fs.readFileSync(templateFullPath, 'utf-8') || '';
                const newFileString = replaceTemplateVars(fileTemplate, params);
                
                // Write file
                fs.writeFileSync(path.join(destinationPath, `${route}.js`), newFileString, (err) => {
                    if (err) throw err;
                });
                logWithColor(colors.FgCyan, `Created ${route}.js at ${path.join(destinationPath, `${route}.js`)}`)
            }
            else {
                logWithColor(colors.FgRed, `Something went wrong getting ${metaDataTemplate}.`)
            }
        })
    }
}
module.exports = writeGeneratedFiles;