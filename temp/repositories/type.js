const axios = require('axios');

const typeRepository = async (typeInputs) => {
    const data = axios.get(typeData, { validateStatus: false });
    return data;
}

module.exports = {
    fetchData: axios,
    typeRepository
};