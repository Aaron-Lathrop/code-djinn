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
exports.replaceTemplateVars = replaceTemplateVars;
