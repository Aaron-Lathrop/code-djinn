const path = require('path');
const { getTemplateElements, runTemplateScript, getNewFileString } = require("../utils/templateUtils");
const { readFileSync, rootPath, writeFileSync, reduceFilesInDirectory, makeDirectorySync } = require("../utils/fsUtils");

// build new files
const addNewFileData = (currentDirectory, currentDirnet, accumulatedData, context, outputDir) => {
    const templateContents = readFileSync(path.join(currentDirectory, currentDirnet.name));
    const { template, script } = getTemplateElements(templateContents);
    const templateContext = runTemplateScript(script, context);

    const contents = getNewFileString(template, templateContext);
    const templateFileName = currentDirnet.name;
    const fileName = templateContext.fileName;
    const directory = currentDirectory.replace(currentDirectory.split(path.sep)[0], outputDir);
    if (contents) {
        accumulatedData.push({
            fileName,
            directory,
            path: path.join(directory, fileName),
            contents,
            templateFileName,
            templatePath: path.join(currentDirectory, templateFileName),
            templateContents,
            rewritable: templateContext.rewritable || false
        });
    }
    return accumulatedData;
};
/**
 * Returns an object that maps a list of newFileStrings to their destination folder.
 */
const getNewFileData = (templateDir, outputDir, newFileData = [], context = {}) => new Promise((resolve, reject) => {
    try {
        const newFiles = reduceFilesInDirectory(
            templateDir,
            addNewFileData,
            newFileData,
            context,
            outputDir
        );
        resolve(newFiles);
    } catch (err) {
        reject(err);
    }
});
/**
 * Builds new files from templates in the specified template directory using the same folder structure found in the template directory.
 */
const buildNewFiles = (state) => async ({ templateDir = state.templateDir, outputDir = state.outputDir, contexts = state.contexts }) => {
    if (contexts && contexts.length > 0) {
        contexts.forEach(context => {
            getNewFileData(templateDir, outputDir, [], context)
                .then(newFileData => {
                    newFileData.forEach(newFile => {
                        makeDirectorySync(rootPath(newFile.directory));
                        writeFileSync(newFile.path, newFile.contents, newFile.fileName, newFile.rewritable, true);
                    });
                })
                .catch(err => console.log(err));
        });
    } else {
        console.error('buildNewFiles requires an object with the keys "templateDir", "outputDir", and "contexts" as a parameter');
    }
};

module.exports = {
    addNewFileData,
    getNewFileData,
    buildNewFiles
};
