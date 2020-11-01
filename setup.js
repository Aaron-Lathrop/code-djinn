const fs = require('fs');
const path = require('path');

/**
 * Want to create a base config json file with:
 *  1. templatePath
 *  2. templateFileName
 *  3. all params found for each templateFile with default value of null (e.g. force user to fill out with what they want)
 * 
 *  As a user, to build the base for an api that just gets data from another source I should only have to provide:
 *  1. The routes I'd like to have in the api
 *  2. The params for each route (e.g. the url queries and/or the keys in the json POST to the endpoint)
 *  3. The templates (including folder structure) I'd like to have
 * 
 *  Config could look like this when auto-generated (user must fill out details)
 * 
 *  [
 *      {
 *          "route": "type",
 *          "params": "search"
 *      }
 *  ]
 * 
 */

function setup(templatePath, destinationPath, templateFiles = []) {
    // Add destination path if it doesn't exist already
    createDirectory(path.join(process.cwd(), destinationPath));

    // Recursively add all sub-folders
    const files = readDirSync(path.join(process.cwd(), templatePath));
    files.forEach(dirnet => {
        if (dirnet.isFile()) {
            const metaData = createTemplateMetaData(path.join(templatePath, dirnet.name), dirnet.name);
            templateFiles.push(metaData);
        }
        if (dirnet.isDirectory()) {
            // Call method again but one-level deeper
            setup(path.join(templatePath, dirnet.name), path.join(destinationPath, dirnet.name), templateFiles);
        }
    });

    writeTemplateMetaDataJSONFile(templateFiles);

    return templateFiles;
}

exports.setup = setup;

function createDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

function readDirSync(dir) {
    return fs.readdirSync(dir, { withFileTypes: true });
}

function getCleanedTemplateVars(dir) {
    const fileTemplate = fs.readFileSync(dir, 'utf-8');
    const templateVarsMatches = fileTemplate && fileTemplate.match(/({{\w*}})/g) || [];
    return templateVarsMatches.map(variable => variable.replace(/{{|}}/g, ''));
}

function getTemplateParams(cleanedTemplateVars) {
    const templateParams = {};
    cleanedTemplateVars.forEach(match => {
        if (templateParams[match] == null || typeof templateParams[match] === 'undefined')
            templateParams[match] = "";
    });
    return templateParams;
}

function createTemplateMetaData(templateFullPath, templateFileName) {
    const cleanedTemplateVars = getCleanedTemplateVars(templateFullPath);
    const params = getTemplateParams(cleanedTemplateVars);
    return {
        templateFullPath,
        templateFileName,
        params
    };
}

function writeTemplateMetaDataJSONFile(data) {
    if (data.length > 0) {
        fs.writeFileSync(path.join(process.cwd(), 'templateMetaData.json'), JSON.stringify(data, null, 2), (err) => { if (err) throw err; })
    }
}