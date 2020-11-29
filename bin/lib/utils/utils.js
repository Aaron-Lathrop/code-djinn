const willDeprecate = (deprecationMessage, ...messages) => {
    console.warn(`\x1b[31m%s\x1b[0m`, `DEPRECATION NOTICE: ${deprecationMessage}`);
    if (messages)
        messages.forEach(message => console.warn(`\x1b[31m%s\x1b[0m`, message));
};
const willDeprecateState = (state) => {
    const nextStable = 'in the next stable release.';
    const toBeDeprecated = [
        { key: 'paths', when: nextStable, replacement: 'moduleExportPaths' }
    ];
    toBeDeprecated.forEach(item => {
        if (state.hasOwnProperty(item.key)) {
            willDeprecate(`The key "${item.key}" will not be supported ${item.when}`,
                item.replacement ? `Please use key "${item.replacement}" instead.` : ''
            );
        }
        if (state.options.hasOwnProperty(item.key)) {
            willDeprecate(`The option "${item.key}" will not be supported ${item.when}`,
                item.replacement ? `Please use option "${item.replacement}" instead.` : ''
            );
        }
    });
};

module.exports = {
    willDeprecate,
    willDeprecateState
};
