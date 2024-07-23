import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import fs from 'fs/promises';
import Papa from 'papaparse';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const backendApp = express();
const PORT = 3300;

backendApp.use(cors());
backendApp.use(express.json());

const clientesFilePath = join(__dirname, '../../Resources/clientes.csv');

const readClientesFromCsv = async () => {
  try {
    const fileData = await fs.readFile(clientesFilePath, 'utf-8');
    const parsedData = Papa.parse(fileData, { header: true });
    return parsedData.data;
  } catch (error) {
    console.error('Error reading CSV file:', error);
    return [];
  }
};

const writeClientesToCsv = async (clientes) => {
  try {
    const csv = Papa.unparse(clientes);
    await fs.writeFile(clientesFilePath, csv, 'utf-8');
  } catch (error) {
    console.error('Error writing to CSV file:', error);
  }
};

ipcMain.handle('get-clientes', async () => {
  return await readClientesFromCsv();
});

ipcMain.handle('add-cliente', async (event, cliente) => {
  const clientes = await readClientesFromCsv();
  cliente.id = uuidv4(); // Generar un ID único
  clientes.push(cliente);
  await writeClientesToCsv(clientes);
  return { success: true };
});

ipcMain.handle('update-cliente', async (event, updatedCliente) => {
  let clientes = await readClientesFromCsv();
  clientes = clientes.map(cliente => cliente.id === updatedCliente.id ? updatedCliente : cliente);
  await writeClientesToCsv(clientes);
  return { success: true };
});

ipcMain.handle('delete-cliente', async (event, id) => {
  let clientes = await readClientesFromCsv();
  clientes = clientes.filter(cliente => cliente.id !== id);
  await writeClientesToCsv(clientes);
  return { success: true };
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false,
    autoHideMenuBar: app.isPackaged,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
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

// Configuración de Express
backendApp.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}`);
});
