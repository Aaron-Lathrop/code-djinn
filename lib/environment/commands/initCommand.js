const { colors, logWithColor } = require('../../utils/consoleUtils');
const createDjinnConfig = require('../../write-files/djinn-config/createDjinnConfig');
const createMetadata = require('../../write-files/metadata/createMetadata');
const createGenerateFilesConfig = require('../../write-files/generate-files/createGenerateFilesConfig');

const init = async () => {
    logWithColor(colors.FgGreen + colors.Underscore, 'Initizaling code-djinn setup...');

    // djinn.config.json
    const djinnConfigFilePath = await createDjinnConfig();
    const djinnConfig = require(djinnConfigFilePath);

    // template-metadata.json
    const metaDataFilePath = await createMetadata(djinnConfig);
    
    // generate-files-config.json
    const configFilePath = await createGenerateFilesConfig(djinnConfig);

    console.log(`After you've finished updating the params in ${configFilePath}, run command 'djinn --generate' to generate the project files.\nYou can also adjust which templates should be used for each route.\nYou can adjust whether files generated from a template are rewritable in ${metaDataFilePath}`);
};

module.exports = init;