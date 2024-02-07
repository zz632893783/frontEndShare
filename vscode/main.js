// const { spawn } = require('child_process');
const { spawn } = require('cross-spawn');
// const { spawn } = require('better-spawn');
// const { spawn } = require('cross-spawn-with-kill');

// const process = spawn('npm', ['run', 'dev'], { cwd: 'F:/demo/vite-5.1.0' });
const { app, BrowserWindow, ipcMain, dialog, fs } = require('electron');
const nodefs = require('fs');
const path = require('path');
// 递归获取目录树结构
const readDirectoryTree = async dirPath => {
    // 存储树形结构数据的数组
    const tree = [];
    try {
        // 读取目录内容
        const entries = await nodefs.promises.readdir(dirPath);
        for (const entry of entries) {
            const entryPath = path.join(dirPath, entry);
            // 获取文件或文件夹的状态
            const stats = await nodefs.promises.stat(entryPath);

            if (stats.isDirectory()) {
                // 如果是文件夹，递归调用函数
                const subTree = await readDirectoryTree(entryPath);
                tree.push({
                    name: entry,
                    type: 'directory',
                    children: subTree,
                    fullPath: entryPath
                });
            } else {
                // 如果是文件，添加到树形结构
                tree.push({
                    name: entry,
                    type: 'file',
                    fullPath: entryPath
                });
            }
        }
    } catch (error) {
        console.error(`Error reading directory tree: ${error}`);
    }
    return tree;
};
// 遍历文件目录递归函数
// try {
//   require('electron-reloader')(module, {});
// } catch (_) {}
let projectProcess;
const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1600,
        height: 860,
        webPreferences: {
            asar: false,
        	nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: false,
            // 确保开发者工具在窗口创建时打开
            devTools: true
        }
    })
    // 加载 index.html
    mainWindow.loadFile('./dist/index.html');
    // mainWindow.loadURL('http://127.0.0.1:5173/');
    // 打开开发工具
    // mainWindow.webContents.openDevTools()

    // 设置 IPC 监听器
    ipcMain.on('execute-command', async (event, command, path) => {
        let directory = path.replace(/(?<=(\/|\\))[^\\\/]+(\\|\/)?$/, '');
        let files = await nodefs.promises.readdir(directory);
        while (!files.includes('package.json')) {
            if (directory === path) {
                break;
            }
            directory = path.replace(/(?<=(\/|\\))[^\\\/]+(\\|\/)?$/, '');
            files = await nodefs.promises.readdir(directory);
            path = directory;
        }
        const commandBlock = command.split(/ +/);
        projectProcess = spawn(commandBlock[0], commandBlock.slice(1), { cwd: directory});

        projectProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`)
            event.reply('execute-command-stdout', [`stdout: ${data.toString('utf-8')}`]);
        });

        projectProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        projectProcess.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
        });
    });
    ipcMain.on('open-folder', async (event) => {
        const { filePaths } = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });
        if (filePaths.length > 0) {
            const folderPath = filePaths[0];
            try {
                const entries = await nodefs.promises.readdir(folderPath);
                const fileDirectory = [];
                const folderDirectory = [];
                for (const entry of entries) {
                    const entryPath = path.join(folderPath, entry);
                    // 获取文件或文件夹的状态
                    const stats = await nodefs.promises.stat(entryPath);
                    stats.isDirectory() ? folderDirectory.push({
                        name: entry,
                        type: 'directory',
                        children: [],
                        fullPath: entryPath
                    }) : fileDirectory.push({
                        name: entry,
                        type: 'file',
                        fullPath: entryPath
                    });
                }
                fileDirectory.sort((x, y) => x.name < y.name ? -1 : (x.name > y.name ? 1 : 0));
                folderDirectory.sort((x, y) => x.name < y.name ? -1 : (x.name > y.name ? 1 : 0));
                // const fileDirectory = await readDirectoryTree(filePaths[0]);
                const temp = folderPath.split(/\\|\//)
                event.reply('folder-content', {
                    name: temp[temp.length - 1],
                    fillPath: folderPath,
                    children: [...folderDirectory, ...fileDirectory]
                });
            } catch (error) {
                console.error('读取文件夹内容失败:', error);
                event.reply('folder-content', []);
            }
        }
    });

    ipcMain.on('execute-command-stop', async event => {
        projectProcess?.kill();
    });

    ipcMain.on('read-file-content', async (event, filePath) => {
        nodefs.readFile(filePath, 'utf-8', (err, content) => {
            !err && event.reply('read-file-content', content);
        });
    });

    ipcMain.on('read-directory-folder-files', async (event, folderPath) => {
        const entries = await nodefs.promises.readdir(folderPath);
        const fileDirectory = [];
        const folderDirectory = [];
        for (const entry of entries) {
            const entryPath = path.join(folderPath, entry);
            // 获取文件或文件夹的状态
            const stats = await nodefs.promises.stat(entryPath);
            stats.isDirectory() ? folderDirectory.push({
                name: entry,
                type: 'directory',
                children: [],
                fullPath: entryPath
            }) : fileDirectory.push({
                name: entry,
                type: 'file',
                fullPath: entryPath
            });
        }
        fileDirectory.sort((x, y) => x.name < y.name ? -1 : (x.name > y.name ? 1 : 0));
        folderDirectory.sort((x, y) => x.name < y.name ? -1 : (x.name > y.name ? 1 : 0));
        event.reply('read-directory-folder-files', [...folderDirectory, ...fileDirectory]);
    });

    ipcMain.on('save-file', async (event, filePath, code) => {
        nodefs.writeFile(filePath, code, (err) => {
            if (err) {
                console.error('写入文件时发生错误：', err);
                return;
            }
            console.log('文件写入成功！');
        });
    });
}
// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
// In this file you can include the rest of your app's specific main process
// code. 也可以拆分成几个文件，然后用 require 导入。