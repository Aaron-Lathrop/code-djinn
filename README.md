# code-djinn

Easily create custom boiler-plate code for projects like APIs, including testing if you like, by providing json and templates.

Code-djinn is useful when creating code bases with predictable file strcutures. If you're copying & pasting existing files, especially multiple files, and changing the same aspects of each file every time you want to add a feature then code-djinn could be a good solution. An example is creating API routes with data retrieval and testing.

Code-djinn is not useful when writing writing entirely custom files that do not follow a predictable structure. If you're writing a utility library with a bunch of unique one-off files then code-djinn is not a good solution to create those files.

## Installation

To install run `npm install code-djinn --save-dev`

## Example build.js file

```javascript
// build.js
const buildPaths = ["dist/dataservices", "dist/models", "dist/repositories"];
const buildContexts = [
	{
		route: "comments",
		inputs: "",
		dataSource: "`https://jsonplaceholder.typicode.com/comments`",
		rewritable: false,
	},
	{
		route: "individual",
		inputs: "search",
		dataSource: "`https://pokeapi.co/api/v2/pokemon/${search}`",
		rewritable: false,
	},
	// as many more routes as you'd like to have...
];
const djinn = require("./djinn");
const builder = djinn();
const { buildNewFiles, buildDirectoryModuleExports } = builder;

builder.build({
	contexts: buildContexts, // context used to generate templates
	paths: buildPaths, // paths to generate directory module exports
	templateDir: "templates", // location to template directory from root
	outputDir: "dist", // location to generated files from root
	options: {
		// additional build options, currently only rewriteAll is available
		rewriteAll: false,
	},
	buildSteps: [
		/* array of functions to be executed asynchronosily, in order from first to last. code-djinn provides the below functions, but any additional user-defined functions can be used as well. code-djinn provides access to all of its functions as part of the object created by running `djinn()` above */
		buildNewFiles,
		buildDirectoryModuleExports,
	],
});
```

## Example template file

Additional is complexity added to this example for illustrative purporses. For example you can, define new functions in the `<script>` section, set the output file's fileName, and write additional lines of code to be injected into the `<template>` section.

```javascript
// template.DataService.txt
<template>
/* Everything in the <template> section will be transformed into the output file using the context provided to the `builder.build()` call in the above build.js example. */
    {{additionalRepos}}
    const {{route}}Repo = require('../repositories/{{route}}Repository');
    const model = require('../models/{{route}}Model');

    const {{route}}DataService = async ({{inputs}}) => {
        {{additionalDataSources}}
        const data = await {{route}}Repo({{inputs}});
        return model({{modelInputs}});
    };

    module.exports = {{route}}DataService;
</template>

<script>
/* Everything in the <script> section will be executed as javascript. Properties like `this.fileName` can be added to the context used to generate the file. Properies like `this.inputs` are added to the global scope for the execution context of generating a single file via the "contexts" property in the object being passed to the `builder.build()` call in the above build.js example. */
    function setFileName(name) {
        if (!name) this.fileName = this.route;
        this.fileName = `${this.fileName}DataService.js`;
    }
    setFileName(this.fileName);

    // Set additional repositories
    if (!this.additionalRepos) this.additionalRepos = '';

    if (Array.isArray(this.additionalRepos)) {
        this.additionalRepos = this.additionalRepos.map(aR => `const ${aR}Repo = require('../repositories/${aR}Repository');`).join('\n\t');
    }

    // Set additional data sources
    if (!this.additionalDataSources) this.additionalDataSources = '';

    if (Array.isArray(this.additionalDataSources)) {
        const allDataSources = ['data'].concat(this.additionalDataSources.map(aDS => `${aDS}Data`));
        this.modelInputs = allDataSources.join(', ');
        this.additionalDataSources = this.additionalDataSources.map(ds => `const ${ds}Data = await ${ds}Repo(${this.inputs});`).join('\n\t');
    } else {
        this.modelInputs = 'data';
    }
</script>
```

## Terms

- ### Templates
  - The basic structure of the final file (example \*.js files) to be created.
  - code-djinn template files are comprised of two sections: `<template>` and `<script>`
    - All text in the `<template>` section is used to generate the final file. Text can be dynamically inserted using `templateVars` (template variables) using the the following syntax `{{myTemplateVar}}`.
      - _Example:_ `const {{route}}Repository = require('./{{route}}Repository');` can generate code like `const pokemonRepository = require('./pokemonRepository');`
    - All text in the `<script>` section will be executed as javascript before templateVars are replaced in the template section using the user provided context. This can be useful in reducing the amount of context actually provided. For example, each template file might have a unique file naming convention, but it might not be convenient to manually write out each file name to be created during the build process. The script section let's you define what the fileName should be in the template itself.
      - _Example:_ In the template.Repository.txt file, `<script>this.fileName = `\`${this.route}Repository\``;</script>` could generate a file named "pokemonRepository.js", while in the template.Model.txt file you might have something like `<script>this.fileName = `\`${this.route}Model\``;</script>` to create a file named "pokemonModel.js"
      - The same is true when creating multiple lines of code at once, say for example a DataService needs to consume a variable number of Repositories. The script section makes it easier to do this by transforming the provided context into the lines of code needed. See the example template.DataService.txt file for an example of how this could be done.
- ### Context
  - The data actually required to generate the files desired.
  - Often times, many files in a code base like an api will be almost identical except for changing a variable name or import here or there. These small changes can be defined in the user defined contexts instead of needing to copy/paste repeatedly.
  - Context should be provided as an array of objects. Each key in each object should be a templateVar name and the value for that key will be what is inserted in the template to generate the final file. An exception to this is if the `<script>` section is used to transform the value into multiple lines of code or to change the value into something more suitable for that specific template.
  - Because the `<script>` section is executed before context is validated and files are generated, templateVars that do not exist in the array of objects can be added for a specific template in the script section. This includes reserved context like "fileName" and "rewritable", see below.
  - _Reserved context:_ There are two keywords that are reserved by the code-djinn library: "fileName" (used to define what the generated file name will be; must include the extension of the file to be generated) and "rewritable" (used to define whether or not a template or context object should be rewritten during the build process; default is false).
