const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { opendir } = require('fs/promises')
const path = require('path');

const defaultEncoding = 'utf-8';

class ErrorNotification {
    constructor(msg) {
        this.notification = new Notification("에러 알림", {body: msg})
    }

    show() {
        this.notification.show();
    }
}

async function getDirectoryTree(dirName, encoding=defaultEncoding) {
    const result = {
        path: dirName,
        name: path.basename(dirName),
        items: []
    }
    const dir = await opendir(dirName, {encoding: encoding});
    for await (const dirent of dir) {
        const direntPath = path.join(dirName, dirent.name);
        if (dirent.isDirectory()) {
            const subTree = await getDirectoryTree(direntPath, encoding=encoding);
            result.items.push(subTree);
        } else {
            result.items.push({
                path: direntPath,
                name: dirent.name,
                items: null
            })
        }
    }
    return result;
}

async function handleOpenDirectory(targetWindow, basePath=app.getPath('documents')) {
    const fileSelect = await dialog.showOpenDialog(targetWindow, {
        title: "폴더를 선택해주세요",
        properties: ['openDirectory'],
        defaultPath: basePath,
        encoding: 'utf-8'
    });
    const result = {
        canceled: fileSelect.canceled,
        content: null
    };
    if (!fileSelect.canceled) {
        result.content = await getDirectoryTree(fileSelect.filePaths[0]).catch((e) => {
            result.canceled = true;
            new ErrorNotification(e).show();
        });
    }
    return result;
}

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'file-tree', 'preload.js'),
            defaultEncoding: 'UTF-8'
        }
    });
    mainWindow.loadFile(path.join('file-tree', 'index.html'));
    mainWindow.webContents.openDevTools();
    return mainWindow;
}

app.whenReady().then(()=>{
    createMainWindow();

    ipcMain.handle('file:openDirectory', () => {
        const focusedWindow = BrowserWindow.getFocusedWindow();
        return handleOpenDirectory(focusedWindow);
    })
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})