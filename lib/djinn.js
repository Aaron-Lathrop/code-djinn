const questionUtils = require('../lib/questions/questionUtils');
const { executeCommand } = require('../lib/environment/commands');

const main = async (processFlags) => {
    try {
        const { longFlag, shortFlags } = processFlags;
        await executeCommand(longFlag.flag, longFlag.argument);
        for (let i = 0; i < shortFlags.length; i++) {
            await executeCommand(shortFlags[i].flag, shortFlags[i].argument);
        }
    } catch (err) {
        throw err;
    } finally {
        questionUtils.closeReader();
    }
};

module.exports = main;
