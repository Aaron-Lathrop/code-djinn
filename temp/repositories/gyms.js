const axios = require('axios');

const gymsRepository = async (gymsInputs) => {
    const data = axios.get(gymsData, { validateStatus: false });
    return data;
}

module.exports = {
    fetchData: axios,
    gymsRepository
};