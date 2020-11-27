const fs = require('fs');
const path = require('path');
const vm = require('vm');

const djinn = exports = module.exports = {};

// utils
const willDeprecate = (message) => console.warn(`\x1b[31m%s\x1b[0m`, `Deprecation notice: ${message}`);
    // functional helpers
const pipe = (initialInput, ...funcs) => funcs.reduce((finalOutput, func) => func(finalOutput), initialInput);
const curry = (initialInput, ...funcs) => funcs.reduceRight((finalOutput, func) => func(finalOutput), initialInput);

    // objects
const deepCopy = (inObj) => {
    if (typeof inObj !== 'object' || inObj === null) return inObj;
    const copyObj = Array.isArray(inObj) ? [] : {};

    for (let key in inObj) {
        const value = inObj[key];
        copyObj[key] = deepCopy(value);
    }
    return copyObj;
};

    // JSON
const stripDoubleQuotes = (str) => {
    if (typeof str !== 'string') {
        console.error(`stripDoubleQuotes: The "str" argument must be of type 'string'. Received '${typeof str}'`);
        return '';
    }
    return str.replace(/\"/g, '');
};
const prettyPrint = (obj, numberOfTabs = 2) => JSON.stringify(obj, null, numberOfTabs);
const formatJSON = (json, pretty = true) => {
    const formattedJSON = json;
    if (typeof formattedJSON === 'object' && pretty) return stripDoubleQuotes(prettyPrint(json));
    else if (typeof formattedJSON === 'object') return stripDoubleQuotes(JSON.stringify(formattedJSON));
    else return stripDoubleQuotes(formattedJSON);
};

    // file system
const rootPath = (dir) => path.join(process.cwd(), dir);
const stripFileExtension = (file) => file.replace(/\.\w*/g, '');
const stripFileNameFromPath = (filePath) => filePath.replace(/\\\w*\.\w*/g, '');
const makeDirectorySync = async (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created new directory: ${dir}`);
    }
};

const readFileSync = (filePath) => fs.readFileSync(filePath, 'utf-8');

const writeFileSync = (filePath, fileString, fileName, rewrite = false, singleFile = false) => {
    try {
        if (stripFileExtension(fileName) !== 'index' && !singleFile) {
            makeDirectorySync(stripFileNameFromPath(filePath));
        }
                
        if (!fs.existsSync(filePath) || rewrite) {
            const action = fs.existsSync(filePath) ? "Rewrote" : "Created";

            fs.writeFileSync(filePath, fileString, (err) => {
                if (err) throw err;
            });
            console.log(`${action} ${fileName} at ${filePath}`);
        }
    } catch (err) {
        console.error(err);
    }
};

const reduceFilesInDirectory = (dir, forEachFile, seedData = {}, ...args) => {
    try {
        const dirnetFiles = fs.readdirSync(dir, { withFileTypes: true }) || [];
        return dirnetFiles.reduce((accumulatedData, currentDirnet) => {
            if (currentDirnet.isFile()) {
                const fileOutput = forEachFile(dir, currentDirnet, accumulatedData, ...args);
                return fileOutput;
            }
            if (currentDirnet.isDirectory()) {
                reduceFilesInDirectory(path.join(dir, currentDirnet.name), forEachFile, accumulatedData, ...args);
            }
            return accumulatedData;
        }, seedData);
    } catch (err) {
        console.log(err);
    }
};

    // formatting functions
const removeTemplateComments = templateContent => templateContent.replace(/(<!--).*?(-->)/gs, '');
const removeEmptyLines = templateContent => templateContent.replace(/(\s*)\$empty/gs, '').trim();
const shiftContentsLeft = templateContent => templateContent.replace(/((    )|\t)(?=\w|{|}|\/\/|\.)/g, '');
const addTrailingEmptyLine = templateContent => `${templateContent}\n`;
const trim = templateContent => templateContent.trim();
const formatContent = (templateContent, ...funcs) => pipe(templateContent, ...funcs);

    // template parsing and script execution
const getTemplateElementContent = (template, element) => {
    const regex = new RegExp(`(?<=<${element}>).*?(?=<\/${element}>)`, 'gs');
    const content = template.match(regex);
    const elementContent = content && content[0] ? content[0] : '';
    return formatContent(elementContent, trim, shiftContentsLeft);
};
const getTemplate = template => getTemplateElementContent(template, 'template');
const getScript = template => getTemplateElementContent(template, 'script');
const getTemplateElements = template => {
    return {
        template: formatContent(getTemplate(template), removeTemplateComments, trim),
        script: getScript(template)
    };
};

const createStore = (context, state) => Object.assign({}, deepCopy(context), state ? { $store: deepCopy(state) } : {});

const runInNewContext = (script, context) => {
    const templateContext = deepCopy(context);
    templateContext.console = console;
    templateContext.Constants = {
        empty: '$empty',
        newLine: '\n',
        tabs: (tabs = 1) => {
            let tabString = '';
            for (let i = 0; i < tabs; i++) tabString += '\t';
            return tabString;
        }
    };
    vm.runInNewContext(script, templateContext, { displayErrors: true, });
    return templateContext;
}

const runTemplateScript = (script, context) => runInNewContext(script, context);

// build

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

    // Validating context here allows for new properties to be added to the
    // context at build-time via the <script> section in each template
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
        .then(fileData => writeFileSync(fileData.path, fileData.contents, fileData.fileName, fileData.rewritable, true))
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

// returns an object that maps a list of newFileStrings to their destination folder
// the buildNewFiles function will take this object and write the files to the disk
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

const buildNewFiles = (state) => async ({ templateDir = state.templateDir, outputDir = state.outputDir, contexts = state.contexts }) => {
    if (contexts && contexts.length > 0) {
        contexts.forEach(context => {
            getNewFileData(templateDir, outputDir, [], context)
                .then(newFileData => {
                    newFileData.forEach(newFile => {
                        makeDirectorySync(rootPath(newFile.directory));
                        writeFileSync(newFile.path, newFile.contents, newFile.fileName, newFile.rewritable);
                    });
                })
                .catch(err => console.log(err));
        });
    } else {
        console.error('buildNewFiles requires an object with the keys "templateDir", "outputDir", and "contexts" as a parameter');
    }
};

    // module exports
const addNodeModuleExportData = (currentDirectory, currentDirnet, accumulatedData, orginialPath, fileName) => {
    const currentFile = currentDirnet.name;
    if (currentFile !== fileName) {
        const sep = path.sep === `\\` ? `\\\\` : path.sep;
        const sepRegex = new RegExp(sep, 'g');
        const orgPathRegex = new RegExp(orginialPath, 'gi');
        const directory = path.join(currentDirectory, currentFile);

        const currentFileNoExt = stripFileExtension(currentFile);
        const requirePath = directory.replace(sepRegex, '/')
                                     .replace(orgPathRegex, '.');
        accumulatedData[currentFileNoExt] = `require('${requirePath}')`;
    }
    return accumulatedData;
};

const getNodeModuleExports = (dir, fileName, moduleExports = {}, orginialPath = dir) => new Promise((resolve, reject) => {
    try {
        const modExports = reduceFilesInDirectory(
            dir,
            addNodeModuleExportData,
            moduleExports,
            orginialPath,
            fileName
        );
        resolve(modExports);
    } catch (err) {
        reject(err);
    }
});

const buildDirectoryModuleExports = (paths, fileName = 'index.js', rewritable = false) => async (state) => {
    if (!Array.isArray(paths))
        paths = state.paths || state.moduleExportPaths;
    if (state.options.rewriteAll === true)
        rewritable = true;
    paths.forEach(p => {
        getNodeModuleExports(p, fileName)
            .then(moduleExports => `module.exports = ${formatJSON(moduleExports)};`)
            .then(fileString => writeFileSync(path.join(p, fileName), fileString, fileName, rewritable))
            .catch(err => console.error(err));
    });
};

// Exports

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

    for (let i = 0; i < buildSteps.length; i++) {
        if (typeof buildSteps[i] === 'function') {
            const step = await buildSteps[i](state);
            if (typeof step === 'function') await step(state);
        }
    }

    if (state.hasOwnProperty('paths')) {
       willDeprecate(`The key "paths" will not be supported as an input for "buildDirectoryModuleExports" in the next stable release.\nPlease use key "moduleExportPaths" instead.`);
    }
}

djinn.validateContext = validateContext;
djinn.getTemplateVars = getTemplateVars;

djinn.templateFormatting = {
    removeTemplateComments,
    removeEmptyLines,
    shiftContentsLeft,
    addTrailingEmptyLine,
    trim,
    formatContent
};

djinn.templateParsing = {
    getTemplateElementContent,
    getTemplate,
    getScript,
    getTemplateElements,
    runInNewContext
};

djinn.fs = {
    rootPath,
    stripFileExtension,
    stripFileNameFromPath,
    makeDirectorySync,
    readFileSync,
    writeFileSync,
    reduceFilesInDirectory
};

djinn.utils = {
    deepCopy,
    stripDoubleQuotes,
    prettyPrint,
    formatJSON
}

djinn.getFileData = getFileData;
djinn.buildFile = buildFile;

djinn.getNewFileData = getNewFileData;
djinn.addNewFileData = addNewFileData;
djinn.getNewFileString = getNewFileString;
djinn.buildNewFiles = buildNewFiles;

djinn.getNodeModuleExports = getNodeModuleExports;
djinn.addNodeModuleExportData = addNodeModuleExportData;
djinn.buildDirectoryModuleExports = buildDirectoryModuleExports;
