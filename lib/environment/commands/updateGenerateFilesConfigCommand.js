const createGenerateFilesConfig = require('../../write-files/generate-files/createGenerateFilesConfig');

const updateGenerateFilesConfig = async () => {
    return Promise.all([
        createGenerateFilesConfig()
    ]);
};

module.exports = updateGenerateFilesConfig;
