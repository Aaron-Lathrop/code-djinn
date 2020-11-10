const djinn = require('../lib');
const getProcessFlags = require('../lib/environment/getProcessFlags');
const flags = getProcessFlags();

djinn(flags);