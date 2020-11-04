const repo = require('../repositories/gymsRepository');
const model = require('../models/gymsModel');

const gymsDataService = async (gymsInputs) => {
    const data = await repo.gymsRepository(gymsInputs);
    return model.gymsModel(data);
}

module.exports = {
    repo,
    model,
    gymsDataService
}