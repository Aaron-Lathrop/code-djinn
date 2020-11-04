const repo = require('../repositories/abilityRepository');
const model = require('../models/abilityModel');

const abilityDataService = async (abilityInputs) => {
    const data = await repo.abilityRepository(abilityInputs);
    return model.abilityModel(data);
}

module.exports = {
    repo,
    model,
    abilityDataService
}