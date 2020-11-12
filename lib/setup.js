const fs = require('fs');
const path = require('path');
const { colors, logWithColor } = require('./utils/consoleUtils');

const { getDjinnEnv } = require('./store/djinnEnvStore');
const { createTemplateMetaData } = require("./utils/template");

const setup = (templatePath, destinationPath, templateMetaData = []) => {
    if (getDjinnEnv().dryrun === false) {
        // Add destination path if it doesn't exist already
        createDirectory(path.join(process.cwd(), destinationPath));
    } else {
        logWithColor(colors.FgCyan, `[Dry run] created new directory at ${path.join(process.cwd(), destinationPath)}`);
    }
        
    // Recursively add all sub-folders
    const files = readDirSync(path.join(process.cwd(), templatePath));
    files.forEach((dirnet) => {
        if (dirnet.isFile()) {
            const tempPath = path.join(templatePath, dirnet.name);
            const fileName = dirnet.name;
            const metaData = createTemplateMetaData(tempPath, fileName, destinationPath);
            templateMetaData.push(metaData);
        }
        if (dirnet.isDirectory()) {
            // Call method again but one-level deeper
            setup(path.join(templatePath, dirnet.name), path.join(destinationPath, dirnet.name), templateMetaData);
        }
    });

    return templateMetaData;
}


function createDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        logWithColor(colors.FgCyan, `Created new directory at ${dir}`);
    }
}

function readDirSync(dir) {
    return fs.readdirSync(dir, { withFileTypes: true });
}

module.exports = setup;