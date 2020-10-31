const fs = require('fs');

function getDirectoriesFromTemplate(dir) {
    try {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        return files || [];
    } catch (err) {
        console.error(err);
        return [];
    }
}

exports.getDirectoriesFromTemplate = getDirectoriesFromTemplate;
