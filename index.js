const fs = require('fs');
const path = require('path');

function main() {
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
                createDirectories(directories);

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
main();

function getProcessVars(process) {
    // Convert args from CLI call to a javaScript object
    const processVariables = {};
    const processArgs = process.argv.slice(2);
    processArgs.forEach((val) => {
        const keyValue = val.split('=');
        const key = keyValue[0];
        const value = keyValue[1];
        processVariables[key] = value;
    });
    return processVariables;
}

function getConfig(processVariables) {
    const configs = require(__dirname + `/${processVariables.config}`) || [];
    return configs;
}

function getTemplateVars(config, fileTemplate) {
    const templateVarRegex = new RegExp(/({{\w*}})/g);
    const templateVarsMatches = fileTemplate.match(templateVarRegex).map(variable => variable.replace(/{{|}}/g, ''));
    const templateVars = {};
    templateVarsMatches.forEach(match => {
        if (templateVars[match] == null || typeof templateVars[match] === 'undefined')
            templateVars[match] = config.params[match];
    });
    return templateVars;
}

function replaceTemplateVars(fileTemplate, templateVars) {
    if (!fileTemplate) throw Error('File could not be fetched or has no contents.');

    let updatedFile = fileTemplate.slice(0);
    const dataVariableText = variable => '{{' + variable + '}}';
    for (let v in templateVars) {
        const regex = new RegExp(dataVariableText(v), 'g');
        updatedFile = updatedFile.replace(regex, templateVars[v]);
    }
    return updatedFile;
}

function createDirectories(templateDirectories) {
    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

    templateDirectories.forEach(dir => {
        if (!fs.existsSync(`./temp/${dir}`)) {
            fs.mkdirSync(`./temp/${dir}`);
            console.log(`Created directory './temp/${dir}'`);
        }
    });
}