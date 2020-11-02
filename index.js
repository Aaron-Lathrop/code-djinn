const { generatefiles } = require("./generatefiles");
const { setup } = require('./setup');
const { writeTemplateMetaDataJSONFile } = require('./setup');

//generatefiles();
const templateFiles = setup('templates', 'temp');
const metaDataFilePath = writeTemplateMetaDataJSONFile(templateFiles);