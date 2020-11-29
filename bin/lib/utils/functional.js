// functional helpers
const pipe = (initialInput, ...funcs) => funcs.reduce((finalOutput, func) => func(finalOutput), initialInput);
const curry = (initialInput, ...funcs) => funcs.reduceRight((finalOutput, func) => func(finalOutput), initialInput);
// objects
const deepCopy = (inObj) => {
    if (typeof inObj !== 'object' || inObj === null)
        return inObj;
    const copyObj = Array.isArray(inObj) ? [] : {};

    for (let key in inObj) {
        const value = inObj[key];
        copyObj[key] = deepCopy(value);
    }
    return copyObj;
};

module.exports = {
    pipe,
    curry,
    deepCopy
}
