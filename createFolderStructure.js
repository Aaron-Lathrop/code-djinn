const fs = require('fs');
const path = require('path');

function createFolderStructure(templateDirectoryPath, destinationPath) {
    if (!fs.existsSync(path.join(process.cwd(), destinationPath))) {
        fs.mkdirSync(path.join(process.cwd(), destinationPath));
    }
    const files = fs.readdirSync(templateDirectoryPath, { withFileTypes: true });
    files.forEach(dirnet => {
        const newPath = path.join(process.cwd(), destinationPath, dirnet.name);
        if (!fs.existsSync(newPath) && dirnet.isDirectory()) {
            fs.mkdirSync(newPath);
        }
        if (dirnet.isDirectory()) {
            createFolderStructure(path.join(templateDirectoryPath, dirnet.name), path.join(destinationPath, dirnet.name));
        }
    });
}
exports.createFolderStructure = createFolderStructure;
