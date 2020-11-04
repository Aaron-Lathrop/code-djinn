const repo = require('../repositories/pokemonRepository');
const model = require('../models/pokemonModel');

const pokemonDataService = async (pokemonInputs) => {
    const data = await repo.pokemonRepository(pokemonInputs);
    return model.pokemonModel(data);
}

module.exports = {
    repo,
    model,
    pokemonDataService
}