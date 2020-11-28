const { getTemplateVars, validateContext, getNewFileString } = require("./utils/templateUtils");
const { stripDoubleQuotes, formatJSON, prettyPrint } = require('./utils/jsonUtils');
const { deepCopy } = require('./utils/functional');

const { getFileData, buildFile } = require("./build/file");
const { getNewFileData, addNewFileData, buildNewFiles } = require("./build/newFiles");
const { getNodeModuleExports, addNodeModuleExportData, buildDirectoryModuleExports } = require("./build/directoryModuleExports");

const djinn = exports = module.exports = {};

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
djinn.build = require('./build/build');

djinn.validateContext = validateContext;
djinn.getTemplateVars = getTemplateVars;

djinn.templateUtils = require('./utils/templateUtils');

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
