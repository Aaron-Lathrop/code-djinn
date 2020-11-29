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

// file from template
const getTemplateVars = template => {
    const templateVars = template.match(/{{\w*}}/g) || [];
    const uniqueTemplateVars = templateVars.reduce((uniqueTVars, currentTemplateVar) => {
        if (!uniqueTVars.includes(currentTemplateVar)) uniqueTVars.push(currentTemplateVar);
        return uniqueTVars;
    }, []);
    return uniqueTemplateVars.map(variable => ({
            cleanVariable: variable.replace(/{{|}}/g, ''),
            variable
        })
    );
}

const validateContext = (templateVars, context) => {
    const missingContext = templateVars.filter(templateVar => !Object.keys(context).includes(templateVar.cleanVariable))
                                       .map(missingItem => missingItem.cleanVariable);
    const isValidContext = missingContext.length === 0;
    if (!isValidContext) {
        throw Error(`When creating new file string, the following keys were missing from the context: [${missingContext.join(', ')}]
        context: ${prettyPrint(context, 12)}`);
    }
    return isValidContext;
}

const getNewFileString = (template, context) => {
    const templateVars = getTemplateVars(template);

    /* Validating context here allows for new properties to be added to the
       context at build-time via the <script> section in each template */
    const isValidContext = validateContext(templateVars, context);
    if (isValidContext) {
        const newFileString = templateVars.reduce((newFileString, currentTemplateVar) => {
            const variables = new RegExp(currentTemplateVar.variable, 'g');
            const withContextValue = context[currentTemplateVar.cleanVariable];
            return formatContent(newFileString, 
                (template) => template.replace(variables, withContextValue), 
                removeEmptyLines,
                addTrailingEmptyLine
            );
        }, template);
        return newFileString || '';
    }
    return;
};

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
    runTemplateScript,
    getTemplateVars,
    validateContext,
    getNewFileString
};
