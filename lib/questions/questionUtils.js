const readline = require('readline');

// https://nodejs.org/api/readline.html
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const closeReader = () => {
    rl.close();
    rl.removeAllListeners();
};

// Questions
const question = (question, callback, ...args) => new Promise((resolve, reject) => {
    try {
        rl.question(question, (answer) => resolve(callback(answer, ...args)))
    } catch (err) {
        reject(err);
    }
});
// Yes/No Questions
const answerYorN = (resolve, answer, tryAgainCallback, ...callbackArgs) => {
    const response = answer.toLowerCase();
    switch (response) {
        case 'y':
            resolve(true);
            break;
        case 'n':
            resolve(false);
            break;
        default:
            console.log('Invalid input, please select "y" or "n".\n');
            resolve(tryAgainCallback(...callbackArgs));
            break;
    }
}

const questionYorN = (question, tryAgainCallback, ...callbackArgs) => new Promise((resolve, reject) => {
    try {
        rl.question(question + " (Y/n): ", (answer) => {
            if (!answer) answer = 'y';
            answerYorN(resolve, answer, tryAgainCallback, ...callbackArgs);
        });
    } catch (err) {
        reject(err);
    }
});

const questionUseInstead = (value) => questionYorN(`> Use "${value}" instead?`, questionUseInstead, value);

// Formatting
const formatDirectoryAnswer = async (orginalQuestion, answer = '') => {
    if (answer.startsWith('/') || answer.startsWith('\\')) {
        console.log(`Folder name cannot start with a "/" or "\\".`);
        const formattedAnswer = answer.slice(answer.search(/[a-z]/gi));
        const useInstead = await questionUseInstead(formattedAnswer);
        if (useInstead) {
            return await formatDirectoryAnswer(formattedAnswer);
        } else {
            console.log(`Please enter a directory`);
            return await orginalQuestion();
        }
    }
    if (answer.search(/\d/gi) > -1) {
        console.log(`Folder names cannot have numbers [0-9].`);
        const formattedAnswer = answer.replace(/[0-9]/gi, '');
        const useInstead = await questionUseInstead(formattedAnswer);
        if (useInstead) {
            return await formatDirectoryAnswer(formattedAnswer);
        } else {
            console.log(`Please enter a directory`);
            return await orginalQuestion();
        }
    }
    return answer;
};
const formatJsonFileName = (answer = '') => answer.replace(/\.\w*/gi, '') + '.json';

module.exports = {
    answerYorN,
    closeReader,
    formatDirectoryAnswer,
    formatJsonFileName,
    question,
    questionYorN,
};
