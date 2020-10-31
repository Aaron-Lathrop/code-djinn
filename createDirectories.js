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
    } catch (err) {
        console.error(err);
    }
}
exports.createDirectories = createDirectories;
