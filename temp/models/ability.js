const abilityModel = (apiResponse) => {
    const model = {
        // add the specific data points desired from the apiResponse here
        // use default values here in case the apiResponse failed
    };
    if (apiResponse && apiResponse.status === 200) {
        const data = apiResponse.data;
        if (data) {
            // load and format the data...
            model = {...apiResponse};
        }
    }
    return model;
}

module.exports = abilityModel;