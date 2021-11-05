const { app, BrowserWindow, ipcMain } = require('electron');
const { opendir } = require('fs/promises')
const path = require('path');

const defaultEncoding = 'utf-8';

async function getDirectoryTree(dirName, encoding=defaultEncoding) {
    const result = {
        path: dirName,
        name: path.basename(dirName),
        items: []
    }
    const dir = await opendir(dirName, {encoding: encoding});
    for await (const dirent of dir) {
        const direntPath = path.join(dirName, dirent.name)
        if (dirent.isDirectory()) {
            const subTree = await getDirectoryTree(direntPath)
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

function createMainWindow() {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'file-tree', 'preload.js')
        }
    });
    mainWindow.loadFile(path.join('file-tree', 'index.html'));
    return mainWindow;
}

function initialize() {
    ipcMain.handle('file:openDirectory', () => {
        
    })
}

app.whenReady().then(()=>{
    createMainWindow();
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