const path = require('path');
const { formatJSON } = require('../utils/jsonUtils');
const { stripFileExtension, reduceFilesInDirectory, writeFileSync } = require('../utils/fsUtils');

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
        paths = state.moduleExportPaths || state.paths;
    if (state.options.rewriteAll === true)
        rewritable = true;
    paths.forEach(p => {
        getNodeModuleExports(p, fileName)
            .then(moduleExports => `module.exports = ${formatJSON(moduleExports)};`)
            .then(fileString => writeFileSync(path.join(p, fileName), fileString, fileName, rewritable, false))
            .catch(err => console.error(err));
    });
};

module.exports = {
    addNodeModuleExportData,
    getNodeModuleExports,
    buildDirectoryModuleExports
}