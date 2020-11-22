const buildPaths = ['dist/dataservices', 'dist/models', 'dist/repositories'];
const { buildContexts } = require("./buildContexts");
const djinn = require('./djinn');
const builder = djinn();
const { buildNewFiles, buildDirectoryModuleExports } = builder;

builder.build({
    contexts: buildContexts,
    paths: buildPaths,
    templateDir: 'templates',
    outputDir : 'dist',
    options: {
    rewriteAll: false
    },
    buildSteps: [
        buildNewFiles,
        buildDirectoryModuleExports
    ]
});