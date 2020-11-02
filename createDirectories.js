const fs = require('fs');
const path = require('path');

function createDirectories(templateDirectories) {
    const root = process.cwd();

    if (!fs.existsSync(path.join(root, 'temp')))
        fs.mkdirSync(path.join(root, 'temp'));

    try {
        templateDirectories.forEach(dir => {
            const destination = path.join(root, 'temp', dir);
            if (!fs.existsSync(destination)) {
                fs.mkdirSync(destination);
                console.log(`Created directory '${destination}'`);
            }
        });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}
exports.createDirectories = createDirectories;
