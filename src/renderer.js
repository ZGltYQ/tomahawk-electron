const ipc = require('electron').ipcRenderer;

const send = document.getElementById('send');
const input = document.getElementById('url');
const tor = document.getElementById('tor');
const threads = document.getElementById('threads');
const logs = document.getElementById('logs');
const stop = document.getElementById('stop');
const query = document.getElementById('query');

setTimeout(() => {
    document.querySelector('body').classList.remove('smoky');
}, 2000);

send.addEventListener('click', () => {
    ipc.send('start', { data: input.value, tor: tor.checked, threads: threads.value, query: query.checked });
});

stop.addEventListener('click', () => {
    ipc.send('stop');
});


ipc.on('logs', (event, data) => {
    console.log(data);
    if (typeof data === 'object') {
        const result = Object.keys(data).map(key => {
            return `<li class='success'>${key}: ${data[key].successfully || 0}</li>\n
            <li class='unsuccess'>${key}: ${data[key].unsuccessfully || 0}</li>`;
        }).join('\n');

        return logs.innerHTML = result;
    }

    return logs.innerHTML = `<li class='success'>${data}</li>`;
});

ipc.on('error', (event, error) => {
    // eslint-disable-next-line no-alert
    alert(error);
});
