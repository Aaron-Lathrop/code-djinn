const fs = require('fs');
const path = require('path');
const { colors, logWithColor } = require('../../utils/consoleUtils');
const { replaceTemplateVars } = require('../../utils/template/replaceTemplateVars');

const { getDjinnEnv } = require('../../store/djinnEnvStore');

const writeGeneratedFiles = (metaDataFilePath, configFilePath, typeOfThing) => {   
    /**
     * For each route in generate-files-config.json (default name), generate a file with the specified params
     * for each template in that route (found in the meta data file)
     */
    try {
        if (fs.existsSync(metaDataFilePath) && fs.existsSync(configFilePath)) {
            const metadata = require(metaDataFilePath);
            const config = require(configFilePath);
            const types = config[typeOfThing];

            for (let type in types) {
                const { templates, params } = types[type];

                templates.forEach(template => {

                    const metaDataTemplate = metadata.find(t => t.templateFileName === template);
                    if (metaDataTemplate) {
                        const { destinationPath, templateFullPath, rewritable } = metaDataTemplate;
                        const fileTemplateString = fs.readFileSync(templateFullPath, 'utf-8') || '';
                        const newFileString = replaceTemplateVars(fileTemplateString, params);
                
                        const fileName = `${type}.js`;
                        const filePath = path.join(destinationPath, fileName);
                        if (getDjinnEnv().dryrun) {
                            logWithColor(colors.FgCyan, `[Dry run] created ${fileName} at ${filePath}`);
                        } else {
                            // Write/rewrite files
                            if (fs.existsSync(filePath) && rewritable) {
                                writeFile(filePath, newFileString, fileName);
                            } else if (fs.existsSync(filePath) && !rewritable) {
                                logWithColor(colors.FgYellow, `Did not update ${filePath} because it is already exists and is marked as not rewritable.`);
                            } else if (!fs.existsSync(filePath)) {
                                writeFile(filePath, newFileString, fileName);
                            }
                        }
                    } else {
                        logWithColor(colors.FgRed, `Something went wrong getting ${metaDataTemplate}.`)
                    }
                });

            }
            // Alert user if any files were not created/rewritten at the end
            if (metadata.some(t => !t.rewritable)) {
                logWithColor(colors.FgYellow, `\nSome templates are not rewritable. Update ${metaDataFilePath} to change this.`);
                logWithColor(colors.FgYellow, `See above for details.`)
            }
        }
        // Alert user that files were not generated and why
        if (!fs.existsSync(metaDataFilePath)) {
            logWithColor(colors.FgRed, `Files not generated. Could not find file at "${metaDataFilePath}". Please update the "metaDataFileName" property in "djinn.config.json".`);
        }
        if (!fs.existsSync(configFilePath)) {
            logWithColor(colors.FgRed, `Files not generated. Could not find file at "${configFilePath}". Please update the "configFileName" property in "djinn.config.json".`);
        }
        if (!fs.existsSync(path.join(process.cwd(), 'djinn.config.json'))) {
            logWithColor(colors.FgYellow, `Files not generated. Could not find djinn.config.json. Try running 'djinn --init' to create this or move the file to the root of the project.`);
        }
    } catch (err) {
        logWithColor(colors.FgRed, err);
        process.exit();
    }
}
module.exports = writeGeneratedFiles;

const writeFile = (filePath, data, fileName) => {
    fs.writeFileSync(filePath, data, (err) => {
        if (err) throw err;
    });
    logWithColor(colors.FgCyan, `Created ${fileName} at ${filePath}`);
};