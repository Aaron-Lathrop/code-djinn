const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { getNodeModuleExports, addNodeModuleExportData, buildDirectoryModuleExports } = require("./build/directoryModuleExports");
const { formatContent, removeEmptyLines, addTrailingEmptyLine, getTemplateElements, runTemplateScript, createStore } = require("./utils/templateUtils");
const { readFileSync, rootPath, writeFileSync, reduceFilesInDirectory, makeDirectorySync } = require("./utils/fsUtils");
const { stripDoubleQuotes, formatJSON, prettyPrint } = require('./utils/jsonUtils');
const { deepCopy } = require('./utils/functional');

const djinn = exports = module.exports = {};

///////////
// utils //
///////////

const willDeprecate = (deprecationMessage, ...messages) => {
    console.warn(`\x1b[31m%s\x1b[0m`, `Deprecation notice: ${deprecationMessage}`);
    if (messages) messages.forEach(message => console.warn(`\x1b[31m%s\x1b[0m`, message));
}

const willDeprecateState = (state) => { 
    const nextStable = 'in the next stable release.';
    const toBeDeprecated = [
        { key: 'paths', when: nextStable, replacement: 'moduleExportPaths' },
        { key: 'rewriteAll', when: nextStable, replacement: null }
    ];
    toBeDeprecated.forEach(item => {
        if (state.hasOwnProperty(item.key)) {
            willDeprecate(`The key "${item.key}" will not be supported ${item.when}`,
                item.replacement ? `Please use key "${item.replacement}" instead.` : ''
            );
        }
        if (state.options.hasOwnProperty(item.key)) {
            willDeprecate(`The option "${item.key}" will not be supported ${item.when}`,
                item.replacement ? `Please use option "${item.replacement}" instead.` : ''
            );
        }
    });
};

///////////
// build //
///////////

// file from template
const getTemplateVars = template => {
    const templateVars = template.match(/{{\w*}}/g) || [];
    const uniqueTemplateVars = templateVars.reduce((uniqueTVars, currentTemplateVar) => {
        if (!uniqueTVars.includes(currentTemplateVar)) uniqueTVars.push(currentTemplateVar);
        return uniqueTVars;
    }, []);
    return uniqueTemplateVars.map(variable => ({
            cleanVariable: variable.replace(/{{|}}/g, ''),
            variable
        })
    );
}

const validateContext = (templateVars, context) => {
    const missingContext = templateVars.filter(templateVar => !Object.keys(context).includes(templateVar.cleanVariable))
                                       .map(missingItem => missingItem.cleanVariable);
    const isValidContext = missingContext.length === 0;
    if (!isValidContext) {
        throw Error(`When creating new file string, the following keys were missing from the context: [${missingContext.join(', ')}]
        context: ${prettyPrint(context, 12)}`);
    }
    return isValidContext;
}

const getNewFileString = (template, context) => {
    const templateVars = getTemplateVars(template);

    /* Validating context here allows for new properties to be added to the
       context at build-time via the <script> section in each template */
    const isValidContext = validateContext(templateVars, context);
    if (isValidContext) {
        const newFileString = templateVars.reduce((newFileString, currentTemplateVar) => {
            const variables = new RegExp(currentTemplateVar.variable, 'g');
            const withContextValue = context[currentTemplateVar.cleanVariable];
            return formatContent(newFileString, 
                (template) => template.replace(variables, withContextValue), 
                removeEmptyLines,
                addTrailingEmptyLine
            );
        }, template);
        return newFileString || '';
    }
    return;
};

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

/////////////
// Exports //
/////////////

/** Sets state for the build process including what the build steps are.
 * 
 *      Accepts an object with the shape 
        {
            contexts: object[],
            moduleExportPaths: string[],
            templateDir: string,
            outputDir : string,
            options: object,
            buildSteps: function[]
        }
 */
djinn.build = async function build(buildState) {
    const { contexts, options, buildSteps } = buildState;

    const state = deepCopy(buildState);
    state.options = options || {};
    state.contexts = state.options.rewriteAll
        ? contexts.map(c => {
            const contextRewrite = createStore(c, state);
            contextRewrite.rewritable = true;
            return contextRewrite;
        })
        : contexts.map(c => createStore(c, state));

    try {
        for (let i = 0; i < buildSteps.length; i++) {
            if (typeof buildSteps[i] === 'function') {
                const step = await buildSteps[i](state);
                if (typeof step === 'function') await step(state);
            }
        }
    } catch (err) {
        console.error(err);
    }

    willDeprecateState(state);
}

djinn.validateContext = validateContext;
djinn.getTemplateVars = getTemplateVars;

const templateUtils = require('./utils/templateUtils');
djinn.templateFormatting = templateUtils.templateFormatting;
djinn.templateParsing = templateUtils.templateParsing;

djinn.fileSystem = require('./utils/fsUtils');

djinn.utils = {
    deepCopy,
    stripDoubleQuotes,
    prettyPrint,
    formatJSON
}

djinn.getFileData = getFileData;

/** Builds a single file with the given template in the output directory using the provided context. 
 * 
 *  The context object will have access to the state object in template <script> sections through the `this.$store` property.
 */
djinn.buildFile = buildFile;

djinn.getNewFileData = getNewFileData;
djinn.addNewFileData = addNewFileData;
djinn.getNewFileString = getNewFileString;

/** Builds files from templates in the specified template directory using the same folder structure found in the template directory.
 * 
 *  Accepts no arguments when called inside the build() method, as this method uses the state specfied in that call.
 * 
 *  Each context object from the state will have access to the entire state through the `this.$store` property.
 */
djinn.buildNewFiles = buildNewFiles;

djinn.getNodeModuleExports = getNodeModuleExports;
djinn.addNodeModuleExportData = addNodeModuleExportData;

/** Builds files which contain all of the module exports for each given directory/path.
 *  Files are built in the same directory as the path being built for.
 * 
 *  NodeJS specifc method
 */
djinn.buildDirectoryModuleExports = buildDirectoryModuleExports;
