const axios = require('axios');

const locationsRepository = async (locationsInputs) => {
    const data = axios.get(locationsData, { validateStatus: false });
    return data;
}

module.exports = {
    fetchData: axios,
    locationsRepository
};