module.exports = djinn;

/**
 * Returns an object with the necessary methods to generate files.
 * 
 * Example use:
 * 
 *      const moduleExportPaths = ['dist/dataservices', 'dist/models', 'dist/repositories'];
        const buildContexts = [
            {
                route: 'individual',
                inputs: 'search',
                dataSource: '`https://pokeapi.co/api/v2/pokemon/${search}`',
                rewritable: false
            },
            // ... additional context objects ...
        ];
        const djinn = require('code-djinn');
        const builder = djinn();
        const { buildFile, buildNewFiles, buildDirectoryModuleExports } = builder;

        builder.build({
            contexts: buildContexts,
            moduleExportPaths,
            templateDir: 'templates',
            outputDir : 'src',
            options: {
                rewriteAll: false
            },
            buildSteps: [
                buildNewFiles,
                buildDirectoryModuleExports(moduleExportPaths, 'index.js', false),
                buildFile('template.App.txt', 'src', {
                    fileName: 'app.js',
                    rewritable: true
                })
            ]
        });
 * 
 * Important methods:
 * 
 *      build(state : object)
 *          Sets state for the build process including what the build steps are.
 *          Accepts an object with the shape 
 *          {
                contexts: object[],
                moduleExportPaths: string[],
                templateDir: string,
                outputDir : string,
                options: object,
                buildSteps: function[]
            }
 * 
 *      buildFile(templateFileName : string, outputDir : string, context : object)
 *          Builds a single file with the given template in the output directory using the provided context.
 *          The context object will have access to the state object in template <script> sections through the
 *          `this.$store` property.
 *          
 * 
 *      buildNewFiles()
 *          Builds files from templates in the specified template directory using the same folder structure found in the template directory.
 *          Accepts no arguments as this method uses the state specfied in the build() call.
 *          Each context object from the state will have access to the entire state through the `this.$store` property.
 *           
 * 
 *      buildDirectoryModuleExports(paths : string[], fileName : string, rewritable : boolean)
 *          NodeJS specifc method: 
 *          Builds files which contain all of the module exports for each given directory/path. Files are built in the same directory.
 *          
 * 
 * See https://github.com/Aaron-Lathrop/code-djinn#readme for more information.
 */
function djinn() {
    return require('./djinn-build');
};
