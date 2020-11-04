const repo = require('../repositories/locationsRepository');
const model = require('../models/locationsModel');

const locationsDataService = async (locationsInputs) => {
    const data = await repo.locationsRepository(locationsInputs);
    return model.locationsModel(data);
}

module.exports = {
    repo,
    model,
    locationsDataService
}