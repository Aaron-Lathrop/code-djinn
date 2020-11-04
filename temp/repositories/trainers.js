const axios = require('axios');

const trainersRepository = async (trainersInputs) => {
    const data = axios.get(trainersData, { validateStatus: false });
    return data;
}

module.exports = {
    fetchData: axios,
    trainersRepository
};