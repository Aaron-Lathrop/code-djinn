const fs = require('fs');
const path = require('path');
const vm = require('vm');

// utils

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
        console.error(`stripDoubleQuotes requires type 'string', received '${typeof str}'`);
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
const makeDirectorySync = async (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created new directory: ${dir}`);
    }
};

const readFileSync = (filePath) => fs.readFileSync(filePath, 'utf-8');

const writeFileSync = (filePath, fileString, fileName, rewrite = false) => {
    if (!fs.existsSync(filePath) || rewrite) {
        fs.writeFileSync(filePath, fileString, (err) => {
            if (err) throw err;
        });
        const action = rewrite ? "Rewrote" : "Created"
        console.log(`${action} ${fileName} at ${filePath}`);
    } else {
        console.log(`Could not rewrite: ${filePath}.`)
    }
};

const reduceFilesInDirectory = (dir, forEachFile, seedData, ...args) => {
    try {
        if (typeof seedData === 'undefined') seedData = {};
        
        const dirnetFiles = fs.readdirSync(dir, { withFileTypes: true }) || [];
        const output = dirnetFiles.reduce((accumulatedData, currentDirnet) => {
            if (currentDirnet.isFile()) {
                const fileOutput = forEachFile(dir, currentDirnet, accumulatedData, ...args);
                return fileOutput;
            }
            if (currentDirnet.isDirectory()) {
                reduceFilesInDirectory(path.join(dir, currentDirnet.name), forEachFile, accumulatedData, ...args);
            }

            return accumulatedData;
        }, seedData);
        return output;
    } catch (err) {
        console.log(err);
    }
};

    // template parsing and script execution
const getTemplateElementContent = (template, element) => {
    const regex = new RegExp(`(?<=<${element}>).*?(?=<\/${element}>)`, 'gs');
    const content = template.match(regex);
    const elementContent = content && content[0] ? content[0] : '';
    return elementContent.trim();
};
const getTemplate = template => getTemplateElementContent(template, 'template');
const getScript = template => getTemplateElementContent(template, 'script');
const getTemplateElements = template => {
    return {
        template: getTemplate(template),
        script: getScript(template)
    };
};

const runInNewContext = (script, context) => {
    const templateContext = deepCopy(context);
    vm.runInNewContext(script, templateContext);
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

const getNewFileString = (rawTemplate = '', context = {}) => {
    const { template, script } = getTemplateElements(rawTemplate);
    const templateVars = getTemplateVars(template);
    const templateContext = runTemplateScript(script, context);
    const isValidContext = validateContext(templateVars, templateContext);
    if (isValidContext) {
        const newFileString = templateVars.reduce((newFileString, currentTemplateVar) => {
            const regex = new RegExp(currentTemplateVar.variable, 'g');
            const replaceWith = templateContext[currentTemplateVar.cleanVariable];
            return newFileString.replace(regex, replaceWith);
        }, template) || '';
        return newFileString;
    }
    return;
};

const addNewFileData = (currentDirectory, currentDirnet, accumulatedData, context) => {
    const templateContents = readFileSync(path.join(currentDirectory, currentDirnet.name));
    const contents = getNewFileString(templateContents, context);
    const templateFileName = currentDirnet.name;
    const fileName = context.fileName;
    const directory = currentDirectory.replace('templates', 'src');
    if (contents) {
        accumulatedData.push({
            fileName,
            directory,
            path: path.join(directory, fileName),
            contents,
            templateFileName,
            templatePath: path.join(currentDirectory, templateFileName),
            templateContents,
            rewritable: context.rewritable
        });
    }
    return accumulatedData;
};

// returns an object that maps a list of newFileStrings to their destination folder
// the buildNewFiles function will take this object and write the files to the disk
const getNewFileData = (dir = 'templates', newFileData = [], context = {}) => new Promise((resolve, reject) => {
    try {
        const newFiles = reduceFilesInDirectory(
            dir,
            addNewFileData,
            newFileData,
            context
        );
        resolve(newFiles);
    } catch (err) {
        reject(err);
    }
});

const buildNewFiles = async (contexts) => {
    contexts.forEach(context => {
        getNewFileData('templates', [], context)
            .then(newFileData => {
                newFileData.forEach(newFile => {
                    const isValidContext = validateContext(getTemplateVars(newFile.templateContents), context);
                    if (isValidContext) {
                        makeDirectorySync(rootPath(newFile.directory));
                        writeFileSync(newFile.path, newFile.contents, newFile.fileName, newFile.rewritable)
                    }
                })
            })
            .catch(err => console.log(err));
    });
};

    // module exports
const addNodeModuleExport = (currentDirectory, currentDirnet, accumulatedData, orginialPath, fileName) => {
    const currentFile = currentDirnet.name;
    if (currentFile !== fileName) {
        const sep = path.sep === `\\` ? `\\\\` : path.sep;
        const sepRegex = new RegExp(sep, 'g');
        const orgPathRegex = new RegExp(orginialPath, 'g', 'i');
        const directory = path.join(currentDirectory, currentFile);

        const currentFileNoExt = currentFile.replace(/\.\w*/gi, '');
        const requirePath = directory.replace(sepRegex, '/')
                                     .replace(orgPathRegex, '.');
        accumulatedData[currentFileNoExt] = `require('${requirePath}')`;
    }
    return accumulatedData;
};

const getNodeModuleExports = (dir, fileName, moduleExports = {}, orginialPath = dir) => new Promise((resolve, reject) => {
    const modExports = reduceFilesInDirectory(
        dir,
        addNodeModuleExport,
        moduleExports,
        orginialPath,
        fileName
    );
    resolve(modExports);
});

const buildDirectoryModuleExports = async (paths, fileName, rewritable) => {
    paths.forEach(p => {
        getNodeModuleExports(p, fileName)
            .then(moduleExports => `module.exports = ${formatJSON(moduleExports)};`)
            .then(fileString => writeFileSync(path.join(rootPath(p), fileName), fileString, fileName, rewritable))
            .catch(err => console.error(err));
    });
};

const build = async ({ contexts, paths }) => {

    await buildNewFiles(contexts);
    await buildDirectoryModuleExports(paths, 'index.js', true);

    // const testScript = `fileName += "DataService";
    //         route += "DataService"`
    // const script = new vm.Script(testScript);
    // console.log(script);
    //const contexts = [{ route: 'something', fileName: 'something' }, { route: 'somethingElse', fileName: 'somethingElse' }];
    // contexts.forEach((context) => {
    // script.runInNewContext(context);
    // });

    // console.log('contexts: ', contexts)

    // const context = contexts[0];
    // const templateConext = deepCopy(context);
    // script.runInNewContext(templateConext);
    // console.log(templateConext);
};

// data
const buildContexts = [
    {
        route: 'zUsers',
        inputs: 'search',
        dataSource: '`https://jsonplaceholder.typicode.com/users`',
        fileName: 'zUsers',
        rewritable: true
    },
    {
        route: 'xUsers',
        inputs: 'search',
        dataSource: '`https://jsonplaceholder.typicode.com/users`',
        fileName: 'xUsers',
        rewritable: true
    }
];

const buildPaths = ['src/dataservices', 'src/models', 'src/repositories', 'src/middleware'];

build({
    contexts: buildContexts,
    paths: buildPaths
});
