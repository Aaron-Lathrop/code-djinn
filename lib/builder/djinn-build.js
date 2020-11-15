const fs = require('fs');
const path = require('path');

// utils
const rootPath = (dir) => path.join(process.cwd(), dir);
const stripDoubleQuotes = (str) => {
    if (typeof str !== 'string') {
        console.error(`stripDoubleQuotes requires type 'string', received '${typeof str}'`);
        return '';
    }
    return str.replace(/\"/g, '');
};
const prettyPrint = (obj) => JSON.stringify(obj, null, 2);
const formatJSON = (json, pretty = true) => {
    const formattedJSON = json;
    if (typeof formattedJSON === 'object' && pretty) return stripDoubleQuotes(prettyPrint(json));
    else if (typeof formattedJSON === 'object') return stripDoubleQuotes(JSON.stringify(formattedJSON));
    else return stripDoubleQuotes(formattedJSON);
};

const makeDirectorySync = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        console.log(`Created new directory: ${dir}`);
    }
};

const readFileSync = (filePath) => fs.readFileSync(path, 'utf-8');

const writeFileSync = (filePath, fileString, fileName) => {
    fs.writeFileSync(filePath, fileString, (err) => {
        if (err) throw err;
    });
    console.log(`Created ${fileName} at ${filePath}`);
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
            else if (currentDirnet.isDirectory()) {
                reduceFilesInDirectory(path.join(dir, currentDirnet.name), forEachFile, accumulatedData, ...args);
            }

            return accumulatedData;
        }, seedData);
        return output;
    } catch (err) {
        console.log(err);
    }
};

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
    if (missingContext.length > 0)
        throw Error(`Error creating new file string, the following keys are missing from the context: [${missingContext.join(', ')}]`);
    
    return missingContext;
}

const getNewFileString = (template = '', context = {}) => {
    const templateVars = getTemplateVars(template);
    validateContext(templateVars, context);
    
    const newFileString = templateVars.reduce((newFileString, currentTemplateVar) => {
        const replaceWith = context[currentTemplateVar.cleanVariable];
        const regex = new RegExp(currentTemplateVar.variable, 'g');
        return newFileString.replace(regex, replaceWith);
    }, template) || '';
    return newFileString;
};

const addNewFileData = (currentDirectory, currentDirnet, accumulatedData, context) => {
    const template = fs.readFileSync(path.join(currentDirectory, currentDirnet.name), 'utf-8');
    accumulatedData.push({
        path: path.join(currentDirectory.replace('templates', 'src'), context.fileName),
        contents: getNewFileString(template, context),
        templatePath: path.join(currentDirectory, currentDirnet.name),
        templateContents: template
    });
    return accumulatedData;
};

// returns an object that maps a list of newFileStrings to their destination folder
// the buildNewFiles function will take this object and write the files to the disk
const getNewFileData = (dir = 'templates', newFileData = [], context = {}) => new Promise((resolve, reject) => {
    try {
        const newFiles = reduceFilesInDirectory(
            dir,
            (currentDirectory, currentDirnet) => addNewFileData(currentDirectory, currentDirnet, newFileData, context),
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
                    writeFileSync(newFile.path, newFile.contents, context.fileName)
                });
            })
            .catch(err => console.log(err));
    });
}

    // module exports
const getModuleExports = (dir, fileName, moduleExports = {}, orginialPath = dir) => new Promise((resolve, reject) => {
    const addModuleExport = (currentDirectory, currentDirnet, accumulatedData, orginialPath) => {
        const currentFile = currentDirnet.name;
        if (currentFile !== fileName) {
            const sep = path.sep === `\\` ? `\\\\` : path.sep;
            const sepRegex = new RegExp(sep, 'g');
            const orgPathRegex = new RegExp(orginialPath, 'g', 'i');
            const directory = path.join(currentDirectory, currentFile);
            const requirePath = directory.replace(sepRegex, '/').replace(orgPathRegex, '.');
            accumulatedData[currentFile.replace(/\.\w*/gi, '')] = `require('${requirePath}')`;
        }
        return accumulatedData;
    };

    const modExports = reduceFilesInDirectory(
        dir,
        (currentDirectory, currentDirnet) => addModuleExport(currentDirectory, currentDirnet, moduleExports, orginialPath),
        moduleExports,
        orginialPath
    );
    resolve(modExports);
});

const buildDirectoryModuleExports = async (paths, fileName) => {
    paths.forEach(p => {
        getModuleExports(p, fileName)
            .then(moduleExports => `module.exports = ${formatJSON(moduleExports)};`)
            .then(fileString => writeFileSync(path.join(rootPath(p), fileName), fileString, fileName))
            .catch(err => console.error(err));
    });
};

const build = async ({ contexts, paths }) => {
    await buildNewFiles(contexts);
    await buildDirectoryModuleExports(paths, 'index.js');
};

// data
const buildContexts = [
    {
        route: 'users',
        inputs: 'search',
        dataSource: '`https://jsonplaceholder.typicode.com/users`',
        fileName: 'zUsers.js'
    }
];

const buildPaths = ['src/dataservices', 'src/models', 'src/repositories', 'src/middleware'];

build({
    contexts: buildContexts,
    paths: buildPaths
});
