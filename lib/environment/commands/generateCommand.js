const createGeneratedFiles = require('../../write-files/generate-files/createGeneratedFiles');

const generate = async () => {
    // Output generated files
    return await createGeneratedFiles();
};

module.exports = generate;
