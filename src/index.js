const { Worker } =      require('worker_threads');
// eslint-disable-next-line security/detect-child-process
const path = require('path');
const fs = require('fs');
// eslint-disable-next-line security/detect-child-process
const { execFile } = require('child_process');
const { app, BrowserWindow, ipcMain } = require('electron');
const detectPort = require('detect-port');
const { setState } = require('./utils/state');

fs.access('logs.txt', (error) => {
    if (error) {
        execFile('tor.exe');
    }

    fs.writeFile('logs.txt', '', () => {});
});

let workers = [];

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
    app.quit();
}

const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width          : 800,
        height         : 600,
        webPreferences : {
            nodeIntegration  : true,
            contextIsolation : false
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // mainWindow.webContents.openDevTools();
};

app.on('ready', createWindow);

function startBomber({ event, urls, tor, threads }) {
    workers = new Array(+threads).fill(new Worker(
        `${__dirname}/bomber.js`,
        { workerData: { urls, tor } }
    ).on('message', ({ url, success }) => event.reply('logs', setState({ url, success }))));
}


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


ipcMain.on('start', async (event, data, tor, threads) => {
    const urls = data.trim().split('\n');

    if (tor) {
        detectPort(9050, (err, _port) => {
            if (err || _port === 9050) {
                event.reply('error', 'Tor proxy is not launch');
            } else startBomber({ event, urls, tor, threads });
        });
    } else startBomber({ event, urls, tor, threads });
});

ipcMain.on('stop', () => {
    workers.forEach(async worker => {
        await worker.terminate();
    });
});

