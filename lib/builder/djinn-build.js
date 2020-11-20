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
const stripFileExtension = (file) => file.replace(/\.\w*/g, '');
const stripFileNameFromPath = (filePath) => filePath.replace(/\\\w*\.\w*/g, '');
const makeDirectorySync = async (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created new directory: ${dir}`);
    }
};

const readFileSync = (filePath) => fs.readFileSync(filePath, 'utf-8');

const writeFileSync = (filePath, fileString, fileName, rewrite = false) => {
    try {
        if (stripFileExtension(fileName) !== 'index') {
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
    // The number of spaces in the below regex matters to properly format the file
    // if you're seeing incorrect spacing in files, double-check the number of spaces
    return elementContent.trim().replace(/    (?=\w|{|})/g, '');
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
    templateContext.console = console;
    templateContext.Constants = {
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
            const regex = new RegExp(currentTemplateVar.variable, 'g');
            const replaceWith = context[currentTemplateVar.cleanVariable];
            return newFileString.replace(regex, replaceWith);
        }, template) || '';
        return newFileString;
    }
    return;
};

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

const buildNewFiles = async (templateDir, outputDir, contexts) => {
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
    const modExports = reduceFilesInDirectory(
        dir,
        addNodeModuleExportData,
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
            .then(fileString => writeFileSync(path.join(p, fileName), fileString, fileName, rewritable))
            .catch(err => console.error(err));
    });
};

const build = async ({ templateDir, outputDir, contexts, paths, options }) => {
    if (!options) options = {};

    const buildContexts = options.rewriteAll
        ? contexts.map(c => {
            const contextRewrite = deepCopy(c);
            contextRewrite.rewritable = true;
            return contextRewrite;
        })
        : contexts;
    
    await buildNewFiles(templateDir, outputDir, buildContexts, options);
    await buildDirectoryModuleExports(paths, 'index.js', true);
};

// data
const buildContexts = [
    {
        route: 'comments',
        inputs: '',
        dataSource: '`https://jsonplaceholder.typicode.com/comments`',
        rewritable: false
    },
    {
        route: 'users',
        inputs: '',
        dataSource: '`https://jsonplaceholder.typicode.com/users`',
        rewritable: false
    },
    {
        route: 'posts',
        inputs: '',
        dataSource: '`https://jsonplaceholder.typicode.com/posts`',
        rewritable: false
    },
    {
        route: 'todos',
        inputs: '',
        dataSource: '`https://jsonplaceholder.typicode.com/todos`',
        rewritable: false
    },
    {
        route: 'individual',
        inputs: 'search',
        dataSource: '`https://pokeapi.co/api/v2/pokemon/${search}`',
        rewritable: false
    }
];

const buildPaths = ['dist/dataservices', 'dist/models', 'dist/repositories'];

build({
    contexts: buildContexts,
    paths: buildPaths,
    templateDir: 'templates',
    outputDir: 'dist',
    options: {
        rewriteAll: false,
    }
});
