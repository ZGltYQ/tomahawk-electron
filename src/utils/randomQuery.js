const randomstring    = require('randomstring');

module.exports = (url) => {
    return `${url}?limit=${Math.floor(Math.random() * 60000) + 30000}&search=${randomstring.generate(3)}&${(new Array(20).fill(`${randomstring.generate(5)}=${randomstring.generate(5)}`)).join('&')}`;
};
