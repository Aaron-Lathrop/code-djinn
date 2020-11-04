const repo = require('../repositories/typeRepository');
const model = require('../models/typeModel');

const typeDataService = async (typeInputs) => {
    const data = await repo.typeRepository(typeInputs);
    return model.typeModel(data);
}

module.exports = {
    repo,
    model,
    typeDataService
}