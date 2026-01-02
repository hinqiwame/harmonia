const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Keep a global reference to prevent garbage collection
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 800,
        minWidth: 400,
        minHeight: 600,
        backgroundColor: '#0a0a0f',
        icon: path.join(__dirname, 'icon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        // Clean window without menu bar or frame
        autoHideMenuBar: true,
        frame: false, // Custom window controls
        show: false
    });

    // Load the app
    mainWindow.loadFile('index.html');

    // Show window when ready to prevent flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// IPC Handlers for Custom Window Controls
ipcMain.on('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on('close-window', () => {
    if (mainWindow) mainWindow.close();
});

// Create window when Electron is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed (Windows/Linux)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// macOS: recreate window when dock icon clicked
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
