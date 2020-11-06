const fs = require('fs');
const { prettyPrintJSON } = require('../../utils/utils');
const { colors, logWithColor } = require('../../utils/consoleUtils');

const writeDjinnConfigJSONFile = (djinnConfigFilePath, djinnConfigData) => {
    fs.writeFileSync(djinnConfigFilePath, prettyPrintJSON(djinnConfigData), (err) => { if (err) throw err; });
    logWithColor(colors.FgCyan, `Created djinn.config.json file at ${djinnConfigFilePath}`);

    return djinnConfigFilePath;
}

module.exports = writeDjinnConfigJSONFile;