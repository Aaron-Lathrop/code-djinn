const { createStore } = require("../utils/templateUtils");
const { willDeprecateState } = require('../utils/utils');
const { deepCopy } = require('../utils/functional');

async function build(buildState) {
    const { contexts, options, buildSteps } = buildState;

    const state = deepCopy(buildState);
    state.options = options || {};
    state.contexts = state.options.rewriteAll
        ? contexts.map(c => {
            const contextRewrite = createStore(c, state);
            // Don't override more specific options with more general options
            if (contextRewrite.hasOwnProperty('rewritable') === false) 
                contextRewrite.rewritable = true;
            return contextRewrite;
        })
        : contexts.map(c => createStore(c, state));

    try {
        for (let i = 0; i < buildSteps.length; i++) {
            if (typeof buildSteps[i] === 'function') {
                const step = await buildSteps[i](state);
                if (typeof step === 'function') await step(state);
            }
        }
    } catch (err) {
        console.error(err);
    }

    willDeprecateState(state);
}

module.exports = build;
