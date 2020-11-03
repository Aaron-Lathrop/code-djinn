const fs = require('fs');
const path = require('path');
const { colors, logWithColor } = require('../utils/consoleUtils');

function writeTemplateMetaDataJSONFile(data) {
    if (data.length > 0) {
        const filePath = path.join(process.cwd(), 'templateMetaData.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), (err) => {
            if (err)
                throw err;
        });
        logWithColor(colors.FgCyan, `\nCreated template meta data file at ${filePath}`);
        return filePath;
    } else {
        console.error('No data was provided to write the template meta data json file.');
        return '';
    }
}

exports.writeTemplateMetaDataJSONFile = writeTemplateMetaDataJSONFile;