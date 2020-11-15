const fs = require('fs');

function readDirSync(dir) {
    return fs.readdirSync(dir, { withFileTypes: true });
}
exports.readDirSync = readDirSync;
