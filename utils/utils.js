const deepCopyObject = (obj) => JSON.parse(JSON.stringify(obj));

const prettyPrintJSON = (obj) => JSON.stringify(obj, null, 2);

module.exports = {
    deepCopyObject,
    prettyPrintJSON
}