const { formatDirectoryAnswer, formatJsonFileName, question } = require('./questionUtils');

// djinn config questions
const templateFolderQuestion = () => question('Template folder name (/templates): ', answer => formatDirectoryAnswer(answer));
const generateFilesFolderQuestion = () => question('Path to generate files to (/src): ', answer => formatDirectoryAnswer(answer));
const metaDataFileNameQuestion = () => question('Template metadata config file name (template-metadata): ', answer => formatJsonFileName(answer));
const configFileNameQuestion = () => question('Generate files config file name (generate-files-config): ', answer => formatJsonFileName(answer));

module.exports = {
    templateFolderQuestion,
    generateFilesFolderQuestion,
    metaDataFileNameQuestion,
    configFileNameQuestion
};
