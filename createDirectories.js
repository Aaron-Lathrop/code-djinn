function createDirectories(fs, templateDirectories) {
    if (!fs.existsSync('./temp'))
        fs.mkdirSync('./temp');

    try {
        templateDirectories.forEach(dir => {
            if (!fs.existsSync(`./temp/${dir}`)) {
                fs.mkdirSync(`./temp/${dir}`);
                console.log(`Created directory './temp/${dir}'`);
            }
        });
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}
exports.createDirectories = createDirectories;
