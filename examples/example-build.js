const moduleExportPaths = ['dist/dataservices', 'dist/models', 'dist/repositories'];
const { buildContexts } = require("./example-buildContexts");
const djinn = require('../bin/djinn');
const builder = djinn();
const { buildFile, buildNewFiles, buildDirectoryModuleExports } = builder;

builder.build({
    contexts: buildContexts,
    moduleExportPaths,
    templateDir: 'example-templates',
    outputDir : 'dist',
    options: {
        rewriteAll: true
    },
    buildSteps: [
        buildNewFiles,
        buildDirectoryModuleExports(moduleExportPaths, "index.js", false),
        buildFile('template.App.txt', 'dist', {
            fileName: 'test-app.js',
            rewritable: true
        })
    ]
});
