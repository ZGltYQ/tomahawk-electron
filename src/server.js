const request = require('request');


setInterval(() => {
    request({
        url    : 'http://212.111.203.181/targets',
        method : 'GET'
    }, (err, res) => {
        if (err) console.log(err);
        console.log(res);
    });
}, 30000);

