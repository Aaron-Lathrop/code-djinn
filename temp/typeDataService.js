const repo = require('../repositories/typeRepository');
const model = require('../models/typeModel');

const typeDataService = async (search) => {
    const data = await repo.typeRepository(search);
    return model.typeModel(data);
}

module.exports = {
    repo,
    model,
    typeDataService
}