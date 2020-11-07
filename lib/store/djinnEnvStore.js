let djinnEnvState = {
    dryrun: false
};
const getDjinnEnv = () => djinnEnvState;
const updateDjinnEnv = (...args) => {
    djinnEnvState = Object.assign({}, djinnEnvState, ...args);
}

module.exports = {
    getDjinnEnv,
    updateDjinnEnv
}
