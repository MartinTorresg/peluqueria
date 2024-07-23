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

const clientesFilePath = join(__dirname, '../../resources/clientes.csv');
const productosServiciosFilePath = join(__dirname, '../../resources/productos_servicios.csv');
const citasFilePath = join(__dirname, '../../resources/citas.csv');
const ventasFilePath = join(__dirname, '../../resources/ventas.csv');

const readDataFromCsv = async (filePath) => {
  try {
    const fileData = await fs.readFile(filePath, 'utf-8');
    const parsedData = Papa.parse(fileData, { header: true });
    return parsedData.data.map(item => ({
      ...item,
      servicios: item.servicios ? JSON.parse(item.servicios) : []
    }));
  } catch (error) {
    console.error(`Error reading CSV file from ${filePath}:`, error);
    return [];
  }
};

const writeDataToCsv = async (filePath, data) => {
  try {
    const csv = Papa.unparse(data.map(item => ({
      ...item,
      servicios: JSON.stringify(item.servicios)
    })));
    await fs.writeFile(filePath, csv, 'utf-8');
  } catch (error) {
    console.error(`Error writing to CSV file at ${filePath}:`, error);
  }
};

// Clientes IPC Handlers
ipcMain.handle('get-clientes', async () => {
  return await readDataFromCsv(clientesFilePath);
});

ipcMain.handle('add-cliente', async (event, cliente) => {
  const clientes = await readDataFromCsv(clientesFilePath);
  cliente.id = uuidv4(); // Generar un ID único
  clientes.push(cliente);
  await writeDataToCsv(clientesFilePath, clientes);
  return { success: true };
});

ipcMain.handle('update-cliente', async (event, updatedCliente) => {
  let clientes = await readDataFromCsv(clientesFilePath);
  clientes = clientes.map(cliente => cliente.id === updatedCliente.id ? updatedCliente : cliente);
  await writeDataToCsv(clientesFilePath, clientes);
  return { success: true };
});

ipcMain.handle('delete-cliente', async (event, id) => {
  let clientes = await readDataFromCsv(clientesFilePath);
  clientes = clientes.filter(cliente => cliente.id !== id);
  await writeDataToCsv(clientesFilePath, clientes);
  return { success: true };
});

// Productos y Servicios IPC Handlers
ipcMain.handle('get-productos-servicios', async () => {
  return await readDataFromCsv(productosServiciosFilePath);
});

ipcMain.handle('add-producto-servicio', async (event, producto) => {
  const productos = await readDataFromCsv(productosServiciosFilePath);
  producto.id = uuidv4(); // Generar un ID único
  productos.push(producto);
  await writeDataToCsv(productosServiciosFilePath, productos);
  return { success: true };
});

ipcMain.handle('update-producto-servicio', async (event, updatedProducto) => {
  let productos = await readDataFromCsv(productosServiciosFilePath);
  productos = productos.map(producto => producto.id === updatedProducto.id ? updatedProducto : producto);
  await writeDataToCsv(productosServiciosFilePath, productos);
  return { success: true };
});

ipcMain.handle('delete-producto-servicio', async (event, id) => {
  let productos = await readDataFromCsv(productosServiciosFilePath);
  productos = productos.filter(producto => producto.id !== id);
  await writeDataToCsv(productosServiciosFilePath, productos);
  return { success: true };
});

// Citas IPC Handlers
ipcMain.handle('get-citas', async () => {
  return await readDataFromCsv(citasFilePath);
});

ipcMain.handle('add-cita', async (event, cita) => {
  const clientes = await readDataFromCsv(clientesFilePath);
  const productosServicios = await readDataFromCsv(productosServiciosFilePath);

  // Buscar el cliente y los servicios completos
  const cliente = clientes.find(c => c.id === cita.clienteId);
  const servicios = cita.servicios.map(servicioId => productosServicios.find(p => p.id === servicioId));

  // Construir la cita completa
  const nuevaCita = {
    ...cita,
    cliente,
    servicios,
  };

  console.log('Clientes:', clientes);
  console.log('Productos y Servicios:', productosServicios);
  console.log('Nueva Cita:', nuevaCita);

  const citas = await readDataFromCsv(citasFilePath);
  nuevaCita.id = uuidv4(); // Generar un ID único
  citas.push(nuevaCita);
  await writeDataToCsv(citasFilePath, citas);
  return { success: true };
});


ipcMain.handle('update-cita', async (event, updatedCita) => {
  let citas = await readDataFromCsv(citasFilePath);
  citas = citas.map(cita => cita.id === updatedCita.id ? updatedCita : cita);
  await writeDataToCsv(citasFilePath, citas);
  return { success: true };
});

ipcMain.handle('delete-cita', async (event, id) => {
  let citas = await readDataFromCsv(citasFilePath);
  citas = citas.filter(cita => cita.id !== id);
  await writeDataToCsv(citasFilePath, citas);
  return { success: true };
});

// Ventas IPC Handlers
ipcMain.handle('get-ventas', async () => {
  return await readDataFromCsv(ventasFilePath);
});

ipcMain.handle('add-venta', async (event, venta) => {
  const ventas = await readDataFromCsv(ventasFilePath);
  venta.id = uuidv4(); // Generar un ID único
  ventas.push(venta);
  await writeDataToCsv(ventasFilePath, ventas);
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
