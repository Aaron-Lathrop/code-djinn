const repo = require('../repositories/trainersRepository');
const model = require('../models/trainersModel');

const trainersDataService = async (trainersInputs) => {
    const data = await repo.trainersRepository(trainersInputs);
    return model.trainersModel(data);
}

module.exports = {
    repo,
    model,
    trainersDataService
}