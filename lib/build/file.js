const path = require('path');
const { getTemplateElements, runTemplateScript, createStore, getNewFileString } = require("../utils/templateUtils");
const { readFileSync, rootPath, writeFileSync } = require("../utils/fsUtils");

// build a single file
const getFileData = async (templatePath, outputLocation, context) => {
    const templateContents = readFileSync(rootPath(templatePath));
    const { template, script } = getTemplateElements(templateContents);
    const templateContext = runTemplateScript(script, context);
    const contents = getNewFileString(template, templateContext);
    const fileName = templateContext.fileName;
    if (contents) {
        return {
            fileName,
            directory: outputLocation,
            path: path.join(outputLocation, fileName),
            contents,
            templateFileName: templatePath,
            templatePath,
            templateContents,
            rewritable: templateContext.rewritable || false
        };
    }
};
const buildFile = (templatePath, outputLocation, context) => async (state) => {
    const store = createStore(context, state);
    getFileData(templatePath, outputLocation, store)
        .then(fileData => writeFileSync(fileData.path, fileData.contents, fileData.fileName, fileData.rewritable, false))
        .catch(err => console.error(err));
};

module.exports = {
    getFileData,
    buildFile
};
