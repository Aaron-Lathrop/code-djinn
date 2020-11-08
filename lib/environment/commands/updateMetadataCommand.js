const createMetadata = require('../../write-files/metadata/createMetadata');
const createGenerateFilesConfig = require('../../write-files/generate-files/createGenerateFilesConfig');

const updateMetadata = async () => {
    return Promise.all([
        createMetadata(),
        createGenerateFilesConfig()
    ]);
};

module.exports = updateMetadata;
