const fs = require('fs');
const path = require('path');

function createFolderStructure(templateDirectoryPath, destinationPath) {
    // Add destination path if it doesn't exist already
    if (!fs.existsSync(path.join(process.cwd(), destinationPath))) {
        fs.mkdirSync(path.join(process.cwd(), destinationPath));
    }

    // Recursively add all sub-folders
    const files = fs.readdirSync(templateDirectoryPath, { withFileTypes: true });
    files.forEach(dirnet => {
        if (dirnet.isDirectory()) {
            // Call method again but one-level deeper
            createFolderStructure(path.join(templateDirectoryPath, dirnet.name), path.join(destinationPath, dirnet.name));
        }
    });
}
exports.createFolderStructure = createFolderStructure;
