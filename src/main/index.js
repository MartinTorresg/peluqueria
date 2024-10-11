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
  try {
    return await readDataFromCsv(clientesFilePath);
  } catch (error) {
    console.error('Error in IPC: get-clientes', error);
  }
});

ipcMain.handle('add-cliente', async (event, cliente) => {
  try {
    const clientes = await readDataFromCsv(clientesFilePath);
    cliente.id = uuidv4(); // Generar un ID único
    clientes.push(cliente);
    await writeDataToCsv(clientesFilePath, clientes);
    return { success: true };
  } catch (error) {
    console.error('Error in IPC: add-cliente', error);
    return { success: false, error };
  }
});

ipcMain.handle('update-cliente', async (event, updatedCliente) => {
  try {
    let clientes = await readDataFromCsv(clientesFilePath);
    clientes = clientes.map(cliente => cliente.id === updatedCliente.id ? updatedCliente : cliente);
    await writeDataToCsv(clientesFilePath, clientes);
    return { success: true };
  } catch (error) {
    console.error('Error in IPC: update-cliente', error);
    return { success: false, error };
  }
});

ipcMain.handle('delete-cliente', async (event, id) => {
  try {
    let clientes = await readDataFromCsv(clientesFilePath);
    clientes = clientes.filter(cliente => cliente.id !== id);
    await writeDataToCsv(clientesFilePath, clientes);
    return { success: true };
  } catch (error) {
    console.error('Error in IPC: delete-cliente', error);
    return { success: false, error };
  }
});

// Productos y Servicios IPC Handlers
ipcMain.handle('get-productos-servicios', async () => {
  try {
    return await readDataFromCsv(productosServiciosFilePath);
  } catch (error) {
    console.error('Error in IPC: get-productos-servicios', error);
  }
});

ipcMain.handle('get-productos-inventario', async () => {
  try {
    const productos = await readDataFromCsv(productosServiciosFilePath);
    return productos.filter(producto => producto.inventario === 'Si');
  } catch (error) {
    console.error('Error in IPC: get-productos-inventario', error);
  }
});

ipcMain.handle('add-producto-servicio', async (event, producto) => {
  try {
    const productos = await readDataFromCsv(productosServiciosFilePath);
    producto.id = uuidv4(); // Generar un ID único
    productos.push(producto);
    await writeDataToCsv(productosServiciosFilePath, productos);
    return { success: true };
  } catch (error) {
    console.error('Error in IPC: add-producto-servicio', error);
    return { success: false, error };
  }
});

ipcMain.handle('update-producto-servicio', async (event, updatedProducto) => {
  try {
    let productos = await readDataFromCsv(productosServiciosFilePath);
    productos = productos.map(producto => producto.id === updatedProducto.id ? updatedProducto : producto);
    await writeDataToCsv(productosServiciosFilePath, productos);
    return { success: true };
  } catch (error) {
    console.error('Error in IPC: update-producto-servicio', error);
    return { success: false, error };
  }
});

ipcMain.handle('delete-producto-servicio', async (event, id) => {
  try {
    let productos = await readDataFromCsv(productosServiciosFilePath);
    productos = productos.filter(producto => producto.id !== id);
    await writeDataToCsv(productosServiciosFilePath, productos);
    return { success: true };
  } catch (error) {
    console.error('Error in IPC: delete-producto-servicio', error);
    return { success: false, error };
  }
});

ipcMain.handle('update-producto-inventario', async (event, { id, cantidad }) => {
  try {
    let productos = await readDataFromCsv(productosServiciosFilePath);
    productos = productos.map(producto => {
      if (producto.id === id) {
        producto.stock = (parseInt(producto.stock) || 0) + cantidad;
      }
      return producto;
    });
    await writeDataToCsv(productosServiciosFilePath, productos);
    return { success: true };
  } catch (error) {
    console.error('Error in IPC: update-producto-inventario', error);
    return { success: false, error };
  }
});

// Citas IPC Handlers
ipcMain.handle('get-citas', async () => {
  try {
    return await readDataFromCsv(citasFilePath);
  } catch (error) {
    console.error('Error in IPC: get-citas', error);
  }
});

ipcMain.handle('add-cita', async (event, cita) => {
  try {
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

    const citas = await readDataFromCsv(citasFilePath);
    nuevaCita.id = uuidv4(); // Generar un ID único
    citas.push(nuevaCita);
    await writeDataToCsv(citasFilePath, citas);
    return { success: true };
  } catch (error) {
    console.error('Error in IPC: add-cita', error);
    return { success: false, error };
  }
});

ipcMain.handle('update-cita', async (event, updatedCita) => {
  try {
    let citas = await readDataFromCsv(citasFilePath);
    citas = citas.map(cita => cita.id === updatedCita.id ? updatedCita : cita);
    await writeDataToCsv(citasFilePath, citas);
    return { success: true };
  } catch (error) {
    console.error('Error in IPC: update-cita', error);
    return { success: false, error };
  }
});

ipcMain.handle('delete-cita', async (event, id) => {
  try {
    let citas = await readDataFromCsv(citasFilePath);
    citas = citas.filter(cita => cita.id !== id);
    await writeDataToCsv(citasFilePath, citas);
    return { success: true };
  } catch (error) {
    console.error('Error in IPC: delete-cita', error);
    return { success: false, error };
  }
});

// Ventas IPC Handlers
ipcMain.handle('get-ventas', async () => {
  try {
    return await readDataFromCsv(ventasFilePath);
  } catch (error) {
    console.error('Error in IPC: get-ventas', error);
  }
});

ipcMain.handle('add-venta', async (event, venta) => {
  try {
    const ventas = await readDataFromCsv(ventasFilePath);
    venta.id = uuidv4(); // Generar un ID único
    ventas.push(venta);
    await writeDataToCsv(ventasFilePath, ventas);

    // Actualizar el inventario de productos vendidos
    for (const servicio of venta.servicios) {
      if (servicio.tipo === 'Producto') {
        await updateProductInventory(servicio.id, -servicio.cantidad);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in IPC: add-venta', error);
    return { success: false, error };
  }
});

const updateProductInventory = async (id, cantidad) => {
  try {
    let productos = await readDataFromCsv(productosServiciosFilePath);
    productos = productos.map(producto => {
      if (producto.id === id) {
        producto.stock = (parseInt(producto.stock) || 0) + cantidad;
      }
      return producto;
    });
    await writeDataToCsv(productosServiciosFilePath, productos);
  } catch (error) {
    console.error('Error updating product inventory:', error);
  }
};

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false,
    autoHideMenuBar: app.isPackaged,
    icon: icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      enableRemoteModule: false
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
