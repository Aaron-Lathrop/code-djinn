const axios = require('axios');

const typeRepository = async (search) => {
    const data = axios.get(`https://pokeapi.co/api/v2/pokemon/${search}`, { validateStatus: false });
    return data;
}

module.exports = {
    fetchData: axios,
    typeRepository
};