# code-djinn

## Alpha phase of development. Breaking changes can be expected; for experimental use only

Report issues at https://github.com/Aaron-Lathrop/code-djinn/issues

Easily create custom boiler-plate code for projects like APIs, including testing if you like, by providing json and templates.

Code-djinn is useful when creating code bases with predictable file strcutures. If you're copying & pasting existing files, especially multiple files, and changing the same aspects of each file every time you want to add a feature then code-djinn could be a good solution. An example is creating API routes with data retrieval and testing.

Code-djinn is not useful when writing entirely custom files that do not follow a predictable structure. If you're writing a utility library with a bunch of unique one-off files then code-djinn is not a good solution to create those files.

## Installation

To install run `npm install code-djinn --save-dev`

## Example build.js file

```javascript
// build.js
const moduleExportPaths = [
	"dist/dataservices",
	"dist/models",
	"dist/repositories",
];
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
const djinn = require("code-djinn");
const builder = djinn();
// Destructuring can be used here, but it will hide intelisense. If this
// doesn't matter to you then destructuring can be used instead.
//const { buildFile, buildNewFiles, buildDirectoryModuleExports } = builder;

builder.build({
	contexts: buildContexts, // context used to generate templates
	moduleExportPaths: moduleExportPaths, // paths to generate directory module exports
	templateDir: "templates", // location to template directory from root (must be at root of project)
	outputDir: "dist", // location to generated files from root
	options: {
		// additional build options, currently only rewriteAll is available
		rewriteAll: false,
	},
	buildSteps: [
		/* array of functions to be executed asynchronously, in order from
		first to last. code-djinn provides the below functions, but any
		additional user-defined functions can be used as well. code-djinn
		provides access to all of its functions as part of the object created
		by running `djinn()` above 
		
		buildNewFiles and buildDirectoryModuleExports can be used without
		calling the method here; they will be called with the object defined above.
		The 'paths' key is required for buildDirectoryModuleExports if you don't
		pass it
		*/
		builder.buildNewFiles(), // or buildNewFiles
		builder.buildDirectoryModuleExports(moduleExportPaths, "index.js", false), // or buildDirectoryModuleExports
		builder.buildFile("template.App.txt", "./", { // this will build at the root of the project
			rewritable: true,
		}),
	],
});
```

## Example template file

Additional is complexity added to this example for illustrative purporses. For example you can, define new functions in the `<script>` section, set the output file's fileName, and write additional lines of code to be injected into the `<template>` section.

"$empty" value for template variable
There are times when you may want to have a template variable that only sometimes
renders content on a line (e.g. "{{additionalRepos}}", and "{{additionalDataSources}}").
Using the value "$empty" let's you render these lines when you want to, and leave them
out when you don't. Not using "$empty" will result in a blank line in the output file.
"this.Constants.empty" is also provided to help access this value.

```html
// template.DataService.txt
<template>
	<!-- Everything in the <template> section will be transformed into the output
file using the context provided to the `builder.build()` call in the above
build.js example. -->
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
	/* Everything in the <script> section will be executed as javascript.
Properties like `this.fileName` can be added to the context used to generate
the file. Properies like `this.inputs` are added to the global scope for the
execution context of generating a single file via the "contexts" property in
the object being passed to the `builder.build()` call in the above build.js
example. 
*/
	
	/* REWRITABLE: The ability to rewrite a template or not can be set at the
				   template-level
	*/
	this.rewritable = false // never rewrite files from this template
	//this.rewritable = true // always rewrite files from this template

	function setFileName(name) {
		if (!name) this.fileName = this.route;
		this.fileName = `${this.fileName}DataService.js`;
	}
	setFileName(this.fileName);

	// Set additional repositories
	if (!this.additionalRepos) this.additionalRepos = "$empty";

	if (Array.isArray(this.additionalRepos)) {
		this.additionalRepos = this.additionalRepos
			.map((aR) => `const ${aR}Repo = require('../repositories/${aR}Repository');`)
			.join("\n\t");
	}

	// Set additional data sources
	if (!this.additionalDataSources) this.additionalDataSources = this.Constants.empty;

	if (Array.isArray(this.additionalDataSources)) {
		const allDataSources = ["data"].concat(
			this.additionalDataSources.map((aDS) => `${aDS}Data`)
		);
		this.modelInputs = allDataSources.join(", ");
		this.additionalDataSources = this.additionalDataSources
			.map((ds) => `const ${ds}Data = await ${ds}Repo(${this.inputs});`)
			.join("\n\t");
	} else {
		this.modelInputs = "data";
	}
</script>
```
## Example template file using "this.$store"
Each context automatically gets a variable called "$store" which contains the entire state
provided in the first argument of builder.build() above. This can be useful if you need
to update files based on all of the contexts provided and not just the current iteration.
This is also useful when using buildFile() so that you can have access to the state provided
which would otherwise not be available.

The example below looks at each context provided in state.contexts and uses the variable "route"
from it to write the code required to expose the endpoint. This is useful when using code-djinn
to write code that is fully functional immediately after building.

```html
// template.App.tx
<template>
    const express = require('express');
    const app = express();

    const ds = require('./dataServices');
    const cors = require('cors');
    const middleware = require('./middleware');

    const PORT = process.env.PORT || 3000;

    // Enter process middleware
    app.disable('x-powered-by');

    app.use(cors());

    for (let m in middleware)
        app.use((req, res, next) => middleware[m](req, res, next))

    // Routes
    {{routes}}

    // Start server
    app.listen(PORT, () => console.log(`app is listening on port: ${PORT}`));
</template>

<script>
    if(!this.fileName) this.fileName = `test-app.js`;

    this.routes = this.$store.contexts.map(c => `
    app.get('/${c.route}', (req, res) => {
        const { search } = req.query;

        ds.${c.route}DataService(search)
            .then(json => res.json(json))
            .catch((err) => console.log(err));
    });`
    ).join('\n');
</script>
```
## Important methods
```javascript
build(state : object)
	/*
	Sets state for the build process including what the build steps are.
	Accepts an object with the shape 
	{
		contexts: object[],
		moduleExportPaths: string[],
		templateDir: string,
		outputDir : string,
		options: object,
		buildSteps: function[]
	}
	*/

buildFile(templateFileName : string, outputDir : string, context : object)
	/*
	Builds a single file with the given template in the output directory using the provided context.
	The context object will have access to the state object in template <script> sections through the
	`this.$store` property.
	*/

buildNewFiles()
	/*
	Builds files from templates in the specified template directory using the same folder structure found in the template directory.
	Accepts no arguments as this method uses the state specfied in the build() call.
	Each context object from the state will have access to the entire state through the `this.$store` property.
	*/
	

buildDirectoryModuleExports(paths : string[], fileName : string, rewritable : boolean)
	/*
	NodeJS specifc method: 
	Builds files which contain all of the module exports for each given directory/path. Files are built in the same directory.
	*/
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
