/**
 * * Created by lee on 2018/12/10
 */

const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path')
const Main = require('../src/main');

app.on('window-all-closed', () => {
    app.quit();
});
app.on('ready', ready);

function ready() {
    try {
        new Main({
            debug: true,
            ipcMain: ipcMain,
            BrowserWindow: BrowserWindow,
            channel: 'main-renderer',
            globalVariable: 'rendererManager', // rendererManager
            capacity: 10, // 每个窗体缓存的消息量
        });
    } catch (e) {}

    let url = 'file://' + path.join(__dirname, './im/im.html')
    // 任何方法加载都行
    global['rendererManager'].load(url, 'im', {
        webPreferences: {
            nodeIntegration: true
        }
    });
}
