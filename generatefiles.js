const fs = require('fs');
const path = require('path');
const { createDirectories } = require("./createDirectories");
const { getConfig } = require("./getConfig");
const { getDirectoriesFromTemplate }  = require('./getDirectoriesFromTemplate');
const { getProcessVars } = require("./getProcessVars");
const { getTemplateVars } = require("./getTemplateVars");
const { replaceTemplateVars } = require("./replaceTemplateVars");

/**
 * Ultimately, I want to recreate the folder structure in the /templates directory
 * and map each file to be created to its appropriate folder based on where
 * its template file is located in the /templates directory
 * 
 * Tasks:
 *  1. createFolderStructure(templateDirectoryPath, destinationDirectoryPath)
 *  2. mapJSONTemplatePathToTemplateFile() 
 *  3. mapFilesToFolders()
 * 
 * {
 *  files: [],
 *  dataServices: { files: ['template.DataService.txt'],
 *  models: { files: [] },
 *  repositories: { files: ['template.Repository.txt'] }
 *  test: {
 *      dataServices: { files: ['template.DataService.test.txt']},
 *      models: { files: [] },
 *      repositories: { files: ['template.Repository.test.txt'] }
 *  }
 * }
 */

function generatefiles() {     
    // Get Directories from Template
    const files = getDirectoriesFromTemplate(path.join(process.cwd(), 'templates'));
    const getDirectories = source => {
        const directories =  source && source.filter(dirnet => dirnet.isDirectory()).map(dirnet => dirnet.name);
        const files = source && source.filter(dirnet => !dirnet.isDirectory()).map(dirnet => dirnet.name);
        return {
            directories,
            files
        };
    };
    const directories = getDirectories(files).directories;
    console.log(getDirectories(files));

    // Get config and process config to generate files
    const processVariables = getProcessVars();
    const configs = getConfig(processVariables);

    // Generate files based on each config
    configs.forEach((config) => {
        fs.readFile(config.template, 'utf8', (err, fileTemplate) => {
            if (err)
                throw err;

            try {
                // Based on file naming convention of 'template.ScriptType.txt'
                const scriptType = config.template && config.template.split('.')[1];

                const templateVars = getTemplateVars(config, fileTemplate);
                const updatedFile = replaceTemplateVars(fileTemplate, templateVars);
                const directoriesCreated = createDirectories(directories);

                if (directoriesCreated) {
                    // Write all files to disk or have a dryRun to make sure things are configured correctly
                    console.log('config.route: ', config.route);
                    console.log('scriptType: ', scriptType);
                    const destinationPath = path.join(process.cwd(), 'temp', `${config.route + scriptType}.js`);
                    if (processVariables.dryRun) {
                        console.log(`\nCreated ${destinationPath}`);
                        console.log(updatedFile + '\n');
                    } else {
                        fs.writeFile(destinationPath, updatedFile, (err) => {
                            if (err)
                                throw err;
                            console.log(`Created ${destinationPath}`);
                        });
                    }
                } else throw Error('Files not generated due to an error creating the required directories.');
            }
            catch (err) {
                console.error(err);
            }
        });
    });
}
exports.generatefiles = generatefiles;