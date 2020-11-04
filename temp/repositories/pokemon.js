const axios = require('axios');

const pokemonRepository = async (pokemonInputs) => {
    const data = axios.get(pokemonData, { validateStatus: false });
    return data;
}

module.exports = {
    fetchData: axios,
    pokemonRepository
};