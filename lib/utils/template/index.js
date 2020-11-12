const fs = require('fs');
const path = require('path');

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

function replaceTemplateVars(fileTemplate, templateVars) {
    if (!fileTemplate)
        throw Error('File could not be fetched or has no contents.');

    let updatedFile = fileTemplate.slice(0);
    const dataVariableText = variable => '{{' + variable + '}}';
    for (let v in templateVars) {
        const regex = new RegExp(dataVariableText(v), 'g');
        updatedFile = updatedFile.replace(regex, templateVars[v]);
    }
    return updatedFile;
}

module.exports = {
    createTemplateMetaData,
    getCleanedTemplateVars,
    getTemplateParams,
    replaceTemplateVars
};
