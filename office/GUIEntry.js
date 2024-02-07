const { app, BrowserWindow } = require('electron');
const path = require('path');
const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const { spawn } = require('cross-spawn');

const serve = express();
// 启动接口
serve.get('/api', async (req, res) => {
    // 获取传参
    const { startCol = 5, filename = '城运中心子项目', start = '2010-02-03' } = req.query;
    exec(`node excelCreateWordDay.js ${ startCol } ${ filename } ${ start }`);
    // const projectProcess = spawn('node', ['excelCreateWordDay.js', startCol, filename, start]);
    // projectProcess.stdout.on('data', (data) => {
    //     console.log(`stdout: ${data}`)
    // });
    // 设置响应状态码和响应体
    const files = await fs.promises.readdir(__dirname);
    res.status(200).json({
        message: 'success2',
        exist: JSON.stringify(files),
        type: typeof spawn,
        cmd: `node excelCreateWordDay.js ${ startCol } ${ filename } ${ start }`,
        cwd: process.cwd()
    });
}).listen(3100, () => console.log('Server is running on http://localhost:3100'));

function createWindow() {
    // 创建浏览器窗口
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: { nodeIntegration: true }
    });

    mainWindow.loadFile('GUIPage.html');

    // 打开开发者工具
    // mainWindow.webContents.openDevTools();

    // 接收用户输入和操作
    mainWindow.webContents.on('context-menu', (e, params) => {
        const { x, y } = params;
        console.log('context-menu')
    });
}

app.whenReady().then(createWindow);

// 禁用硬件加速，以避免在某些情况下出现的问题
app.disableHardwareAcceleration();

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