import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false,
    autoHideMenuBar: app.isPackaged,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    if (app.isPackaged) {
      mainWindow.maximize();
    }
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  if (!app.isPackaged) {
    const devMenu = Menu.buildFromTemplate([
      {
        label: 'Desarrollo',
        submenu: [
          { role: 'reload', label: 'Recargar' },
          { role: 'forcereload', label: 'Forzar recarga' },
          { role: 'toggledevtools', label: 'Alternar herramientas de desarrollo' },
          { type: 'separator' },
          { role: 'resetzoom', label: 'Restablecer zoom' },
          { role: 'zoomin', label: 'Acercar' },
          { role: 'zoomout', label: 'Alejar' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'Alternar pantalla completa' },
        ],
      },
    ]);
    Menu.setApplicationMenu(devMenu);
  } else {
    Menu.setApplicationMenu(null);
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('close-app', () => {
  app.quit();
});

ipcMain.handle('reload-app', () => {
  app.relaunch();
  app.exit();
});
