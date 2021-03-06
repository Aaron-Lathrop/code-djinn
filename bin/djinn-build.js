const build = require('./lib/build/build');
const { buildFile } = require("./lib/build/file");
const { buildNewFiles } = require("./lib/build/newFiles");
const { buildDirectoryModuleExports } = require("./lib/build/directoryModuleExports");

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
djinn.build = build;

/** Builds a single file with the given template in the output directory using the provided context. 
 * 
 *  The context object will have access to the state object in template <script> sections through the `this.$store` property.
 */
djinn.buildFile = buildFile;

/** Builds files from templates in the specified template directory using the same folder structure found in the template directory.
 * 
 *  Accepts no arguments when called inside the build() method, as this method uses the state specfied in that call.
 * 
 *  Each context object from the state will have access to the entire state through the `this.$store` property.
 */
djinn.buildNewFiles = buildNewFiles;

/** Builds files which contain all of the module exports for each given directory/path.
 *  Files are built in the same directory as the path being built for.
 * 
 *  NodeJS specifc method
 */
djinn.buildDirectoryModuleExports = buildDirectoryModuleExports;
