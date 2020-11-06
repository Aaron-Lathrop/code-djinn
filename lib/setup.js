const fs = require('fs');
const path = require('path');
const { colors, logWithColor } = require('./utils/consoleUtils');

function setup(templatePath, destinationPath, templateMetaData = []) {
    // Add destination path if it doesn't exist already
    createDirectory(path.join(process.cwd(), destinationPath));

    // Recursively add all sub-folders
    const files = readDirSync(path.join(process.cwd(), templatePath));
    files.forEach((dirnet) => {
        if (dirnet.isFile()) {
            const tempPath = path.join(templatePath, dirnet.name);
            const fileName = dirnet.name;
            const metaData = createTemplateMetaData(tempPath, fileName, destinationPath);
            templateMetaData.push(metaData);
        }
        if (dirnet.isDirectory()) {
            // Call method again but one-level deeper
            setup(path.join(templatePath, dirnet.name), path.join(destinationPath, dirnet.name), templateMetaData);
        }
    });

    return templateMetaData;
}


function createDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        logWithColor(colors.FgCyan, `Created new directory at ${dir}`);
    }
}

function readDirSync(dir) {
    return fs.readdirSync(dir, { withFileTypes: true });
}

function getCleanedTemplateVars(dir) {
    const fileTemplate = fs.readFileSync(path.join(process.cwd(), dir), 'utf-8');
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

function createTemplateMetaData(templateFullPath, templateFileName, destinationPath) {
    const cleanedTemplateVars = getCleanedTemplateVars(templateFullPath);
    const params = getTemplateParams(cleanedTemplateVars);
    return {
        destinationPath,
        templateFullPath,
        templateFileName,
        rewritable: false,
        params
    };
}

exports.setup = setup;