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
exports.getTemplateVars = getTemplateVars;
