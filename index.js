const fs = require('fs');
const { dirname } = require('path');
const path = require('path');
// Convert args from CLI call to a javaScript object
const processVariables = {};
const processArgs = process.argv.slice(2);
processArgs.forEach(function (val, index, array) {
    const keyValue = val.split('=');
    const key = keyValue[0];
    const value = keyValue[1];
    processVariables[key] = value;
});


const files = fs.readdirSync('./templates', { withFileTypes: true });
const getDirectories = source => source.filter(dirnet => dirnet.isDirectory())
    .map(dirnet => dirnet.name);
const directories = getDirectories(files);
// files.forEach(file => {
//     //const symbolKey = Reflect.ownKeys(file).find(key => key.toString() === 'Symbol(type)')
//     // if file[symbolKey] === 2 then it is a directory, otherwise if it's 1 it's a file
// })


// Get config and process config to generate files
const configs = require(__dirname + `/${processVariables.config}`) || [];

configs.forEach((config) => {
    fs.readFile(config.template, 'utf8', (err, fileContents) => {
        if (err) throw err;

        // Template Variables
        const templateVarRegex = new RegExp(/({{\w*}})/g);
        const templateVarsMatches = fileContents.match(templateVarRegex).map(variable => variable.replace(/{{|}}/g, ''));
        const templateVars = {};
        templateVarsMatches.forEach(match => {
            if (templateVars[match] == null || typeof templateVars[match] === 'undefined')
                templateVars[match] = config.params[match];
        })

        // Based on file naming convention of 'template.ScriptType.txt'
        const scriptType = config.template.split('.')[1];

        // Replace template variables in data string
        const dataVariableText = variable => '{{' + variable + '}}';
        //const variablesToReplace = { repo, model, dataService, dataSource, args };
        for (let v in templateVars) {
            const regex = new RegExp(dataVariableText(v), 'g');
            fileContents = fileContents.replace(regex, templateVars[v]);
        }

        
        // Create path to write files to if it doesn't exist
        createDirectories(directories);

        // Write all files to disk or have a dryRun to make sure things are configured correctly
        const destinationPath = __dirname + `/temp/${config.route}${scriptType}.js`;
        if (processVariables.dryRun) {
            console.log(`\nCreated ${destinationPath}`);
            console.log(fileContents + '\n');
        } else {
            fs.writeFile(destinationPath, fileContents, (err) => {
                if (err) throw err;
                console.log(`Created ${destinationPath}`);
            });
        }
    });
})

function createDirectories(templateDirectories) {
    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

    templateDirectories.forEach(dir => {
        if (!fs.existsSync(`./temp/${dir}`)) {
            fs.mkdirSync(`./temp/${dir}`);

            console.log(`Created directory './temp/${dir}'`);
        } 
    })
}