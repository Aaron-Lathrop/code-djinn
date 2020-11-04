const axios = require('axios');

const abilityRepository = async (abilityInputs) => {
    const data = axios.get(abilityData, { validateStatus: false });
    return data;
}

module.exports = {
    fetchData: axios,
    abilityRepository
};