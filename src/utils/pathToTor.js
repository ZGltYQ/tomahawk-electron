
module.exports = function pathToTor(platform) {
    const condition = {
        'darwin'  : 'tor',
        'linux'   : 'tor',
        'windows' : `${__dirname}/Tor/tor.exe`
    };

    return condition[platform];
};
