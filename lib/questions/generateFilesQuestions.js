const { question, questionYorN } = require('./questionUtils');

const rewriteFileQuestion = (fileName) => questionYorN(`Rewrite ${fileName}?`, rewriteFileQuestion, fileName);
const generateFilesQuestion = (metaDataFileName, configFileName, generationPath) =>
    questionYorN(`Generate files from "${metaDataFileName}" and "${configFileName}" to path ${generationPath}?`, generateFilesQuestion, metaDataFileName, configFileName);

// generate files questions
const routesQuestion = () => question('\nWhat routes will your api have? (example input - "pokemon, type, ability"): ', (answer = '') => {
            console.log(`\nCreating json file for you to complete with inputs for each of these routes:\n[${answer}]`);
            return answer.split(',').map(route => route.replace(',', '').trim());
});
        
module.exports = {
    generateFilesQuestion,
    rewriteFileQuestion,
    routesQuestion
};
