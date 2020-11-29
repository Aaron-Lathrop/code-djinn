const fs = require('fs');
const path = require('path');

// file system
const rootPath = (dir) => path.join(process.cwd(), dir);
const stripFileExtension = (fileName) => fileName.replace(/\.\w*$/g, '');
const stripFileNameFromPath = (filePath) => filePath.replace(/\\\w*\.\w*/g, '');
const makeDirectorySync = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created new directory: ${dir}`);
    }
};
const readFileSync = (filePath) => fs.readFileSync(filePath, 'utf-8');
const writeFileSync = (filePath, fileString, fileName, rewrite = false, createDir = false) => {
    try {
        if (!fs.existsSync(filePath) || rewrite) {
            if (createDir)
                makeDirectorySync(stripFileNameFromPath(filePath));
            const action = fs.existsSync(filePath) ? "Rewrote" : "Created";
            fs.writeFileSync(filePath, fileString, (err) => {
                if (err)
                    throw err;
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

module.exports = {
    rootPath,
    stripFileExtension,
    stripFileNameFromPath,
    makeDirectorySync,
    readFileSync,
    writeFileSync,
    reduceFilesInDirectory
};
