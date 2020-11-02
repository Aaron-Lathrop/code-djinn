const fs = require('fs');
const path = require('path');

function setup(templatePath, destinationPath, templateFiles = []) {
    // Add destination path if it doesn't exist already
    createDirectory(path.join(process.cwd(), destinationPath));

    // Recursively add all sub-folders
    const files = readDirSync(path.join(process.cwd(), templatePath));
    files.forEach((dirnet, i) => {
        if (dirnet.isFile()) {
            const tempPath = path.join(templatePath, dirnet.name);
            const fileName = dirnet.name;
            const metaData = createTemplateMetaData(tempPath, fileName, destinationPath);
            templateFiles.push(metaData);
        }
        if (dirnet.isDirectory()) {
            // Call method again but one-level deeper
            setup(path.join(templatePath, dirnet.name), path.join(destinationPath, dirnet.name), templateFiles);
        }
    });

    return templateFiles;
}

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

function writeTemplateMetaDataJSONFile(data) {
    if (data.length > 0) {
        fs.writeFileSync(path.join(process.cwd(), 'templateMetaData.json'), JSON.stringify(data, null, 2), (err) => { if (err) throw err; })
        console.log(`Created template meta data file at ${path.join(process.cwd(), 'templateMetaData.json')}`);
        return path.join(process.cwd(), 'templateMetaData.json');
    } else {
        console.error('No data was provided to write the template meta data json file.');
        return '';
    }
}

exports.setup = setup;
exports.writeTemplateMetaDataJSONFile = writeTemplateMetaDataJSONFile;