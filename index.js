const fs = require('fs');
const { createDirectories } = require("./createDirectories");
const { getConfig } = require("./getConfig");
const { getProcessVars } = require("./getProcessVars");
const { getTemplateVars } = require("./getTemplateVars");
const { replaceTemplateVars } = require("./replaceTemplateVars");

generatefiles(fs, process, __dirname);

function generatefiles(fs, process, __dirname) {
    // Get Directories from Template
    const files = fs.readdirSync('./templates', { withFileTypes: true });
    const getDirectories = source => source.filter(dirnet => dirnet.isDirectory())
        .map(dirnet => dirnet.name);
    const directories = getDirectories(files);

    // Get config and process config to generate files
    const processVariables = getProcessVars(process);
    const configs = getConfig(processVariables);

    configs.forEach((config) => {
        fs.readFile(config.template, 'utf8', (err, fileTemplate) => {
            if (err) throw err;

            try {
                // Based on file naming convention of 'template.ScriptType.txt'
                const scriptType = config.template.split('.')[1];

                // Template Variables
                const templateVars = getTemplateVars(config, fileTemplate);

                // Replace template variables in data string
                const updatedFile = replaceTemplateVars(fileTemplate, templateVars);
        
                // Create path to write files to if it doesn't exist
                createDirectories(fs, directories);

                // Write all files to disk or have a dryRun to make sure things are configured correctly
                const destinationPath = __dirname + `/temp/${config.route}${scriptType}.js`;
                if (processVariables.dryRun) {
                    console.log(`\nCreated ${destinationPath}`);
                    console.log(updatedFile + '\n');
                } else {
                    fs.writeFile(destinationPath, updatedFile, (err) => {
                        if (err) throw err;
                        console.log(`Created ${destinationPath}`);
                    });
                }
            }
            catch (err) {
                console.error(err);
            }
        });
    })
}