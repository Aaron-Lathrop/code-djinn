const vm = require('vm');
const { pipe, deepCopy } = require('./functional');

// formatting functions
const removeTemplateComments = templateContent => templateContent.replace(/(<!--).*?(-->)/gs, '');
const removeEmptyLines = templateContent => templateContent.replace(/(\s*)\$empty/gs, '').trim();
const shiftContentsLeft = templateContent => templateContent.replace(/((    )|\t)(?=\w|{|}|\/\/|\.)/g, '');
const addTrailingEmptyLine = templateContent => `${templateContent}\n`;
const trim = templateContent => templateContent.trim();
const formatContent = (templateContent, ...funcs) => pipe(templateContent, ...funcs);
// template parsing and script execution
const getTemplateElementContent = (template, element) => {
    const regex = new RegExp(`(?<=<${element}>).*?(?=<\/${element}>)`, 'gs');
    const content = template.match(regex);
    const elementContent = content && content[0] ? content[0] : '';
    return formatContent(elementContent, trim, shiftContentsLeft);
};
const getTemplate = template => getTemplateElementContent(template, 'template');
const getScript = template => getTemplateElementContent(template, 'script');
const getTemplateElements = template => {
    return {
        template: formatContent(getTemplate(template), removeTemplateComments, trim),
        script: getScript(template)
    };
};
const createStore = (context, state) => Object.assign({}, deepCopy(context), state ? { $store: deepCopy(state) } : {});
const runInNewContext = (script, context) => {
    const templateContext = deepCopy(context);
    templateContext.console = console;
    templateContext.Constants = {
        empty: '$empty',
        newLine: '\n',
        tabs: (tabs = 1) => {
            let tabString = '';
            for (let i = 0; i < tabs; i++)
                tabString += '\t';
            return tabString;
        }
    };
    vm.runInNewContext(script, templateContext, { displayErrors: true, });
    return templateContext;
};
const runTemplateScript = (script, context) => runInNewContext(script, context);

module.exports = {
    removeTemplateComments,
    removeEmptyLines,
    shiftContentsLeft,
    addTrailingEmptyLine,
    trim,
    formatContent,
    getTemplateElementContent,
    getTemplate,
    getScript,
    getTemplateElements,
    createStore,
    runInNewContext,
    runTemplateScript
};
