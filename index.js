const fs = require('fs');
const { createDirectories } = require("./createDirectories");
const { generatefiles } = require("./generatefiles");
const { getConfig } = require("./getConfig");
const { getProcessVars } = require("./getProcessVars");
const { getTemplateVars } = require("./getTemplateVars");
const { replaceTemplateVars } = require("./replaceTemplateVars");

const methods = { getProcessVars, getConfig, getTemplateVars, replaceTemplateVars, createDirectories };
generatefiles(fs, process, __dirname, methods);
