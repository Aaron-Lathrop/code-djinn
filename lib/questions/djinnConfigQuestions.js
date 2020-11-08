const { formatDirectoryAnswer, formatJsonFileName, question } = require('./questionUtils');

// djinn config questions
const templateFolderQuestion = () => question('> Template folder name (templates/): ', answer => {
    return !answer ? formatDirectoryAnswer(templateFolderQuestion, 'templates/') : formatDirectoryAnswer(templateFolderQuestion, answer);
});
const generateFilesFolderQuestion = () => question('> Path to generate files to (src/): ', answer => {
    return !answer ? formatDirectoryAnswer(templateFolderQuestion, 'src/') : formatDirectoryAnswer(templateFolderQuestion, answer);
});
const metaDataFileNameQuestion = () => question('> Template metadata config file name (template-metadata): ', answer => {
    return !answer ? formatJsonFileName('template-metadata') : formatJsonFileName(answer);
});
const configFileNameQuestion = () => question('> Generate files config file name (generate-files-config): ', answer => {
    return !answer ? formatJsonFileName('generate-files-config') : formatJsonFileName(answer);
});

module.exports = {
    templateFolderQuestion,
    generateFilesFolderQuestion,
    metaDataFileNameQuestion,
    configFileNameQuestion
};
