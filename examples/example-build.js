const buildPaths = ['dist/dataservices', 'dist/models', 'dist/repositories'];
const { buildContexts } = require("./example-buildContexts");
const djinn = require('../bin/djinn');
const builder = djinn();
const { buildFile, buildNewFiles, buildDirectoryModuleExports } = builder;

builder.build({
    contexts: buildContexts,
    paths: buildPaths,
    templateDir: 'example-templates',
    outputDir : 'dist',
    options: {
        rewriteAll: false
    },
    buildSteps: [
        buildNewFiles(),
        buildDirectoryModuleExports(),
        buildFile('template.App.txt', 'dist', {
            rewritable: true
        })
    ]
});
