import { app, shell, BrowserWindow, ipcMain, Menu } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import ADODB from 'node-adodb';
import mysql from 'mysql2/promise';
import Papa from 'papaparse';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { v4 as uuidv4 } from 'uuid'; // Importar uuid para generar IDs
const execAsync = promisify(exec);
const { PosPrinter } = require('electron-pos-printer');

// Configuración de Express
const backendApp = express();
const PORT = 3300;

backendApp.use(cors());
backendApp.use(express.json());

let originalAccessFile, connection, dbType, mysqlConnection, csvFilePath, registrosFilePath, ip;

async function retry(fn, retries = 3, delay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i < retries - 1) {
        console.warn(`Retrying... (${i + 1}/${retries})`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw error;
      }
    }
  }
}

async function getConfig() {
  try {
    const configPath = app.isPackaged
      ? join(__dirname, '../../../app.asar.unpacked/resources/config.json')
      : join(__dirname, '../../resources/config.json');
    const config = await fs.readFile(configPath, 'utf-8');
    const parsedConfig = JSON.parse(config);
    dbType = parsedConfig.tipoBD;
    ip = parsedConfig.ip;

    // Nuevas variables habilitar impresoras
    const { habilitar80x80, habilitar50x30, habilitar58x44, habilitar100x50 } = parsedConfig;

    // Rutas de archivos CSV
    csvFilePath = join(configPath, '../data.csv');
    registrosFilePath = join(configPath, '../registros.csv');

    // Asegúrate de que las nuevas variables se lean correctamente
    if (parsedConfig.Print50x30) {
      parsedConfig.Print50x30.barCodeHeight = parsedConfig.Print50x30.barCodeHeight || 10;
      parsedConfig.Print50x30.barCodeWidth = parsedConfig.Print50x30.barCodeWidth || 1;
      parsedConfig.Print50x30.barCodeFontSize = parsedConfig.Print50x30.barCodeFontSize || 12;
    }
    if (parsedConfig.Print58x44) {
      parsedConfig.Print58x44.barCodeHeight = parsedConfig.Print58x44.barCodeHeight || 10;
      parsedConfig.Print58x44.barCodeWidth = parsedConfig.Print58x44.barCodeWidth || 1;
      parsedConfig.Print58x44.barCodeFontSize = parsedConfig.Print58x44.barCodeFontSize || 12;
    }
    if (parsedConfig.Print80x80) {
      parsedConfig.Print80x80.barCodeHeight = parsedConfig.Print80x80.barCodeHeight || 10;
      parsedConfig.Print80x80.barCodeWidth = parsedConfig.Print80x80.barCodeWidth || 1;
      parsedConfig.Print80x80.barCodeFontSize = parsedConfig.Print80x80.barCodeFontSize || 12;
    }
    if (parsedConfig.Print100x50) {
      parsedConfig.Print100x50.barCodeHeight = parsedConfig.Print100x50.barCodeHeight || 10;
      parsedConfig.Print100x50.barCodeWidth = parsedConfig.Print100x50.barCodeWidth || 1;
      parsedConfig.Print100x50.barCodeFontSize = parsedConfig.Print100x50.barCodeFontSize || 12;
    }

    if (dbType === 'POSMASTER' || dbType === 'GMM') {
      const basePath = parsedConfig.PosMasterDTE_DIR;
      originalAccessFile = dbType === 'POSMASTER' ? basePath + 'Gestion.mdb' : basePath + 'MAESTROS.mdb';
      connection = ADODB.open(`Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${originalAccessFile};`);
    } else if (dbType === 'EASY') {
      await retry(async () => {
        mysqlConnection = await mysql.createConnection({
          host: ip || '127.0.0.1',  // Usar la IP del config.json
          port: 3306,
          user: 'root',
          password: 'your_password', // Reemplaza con la contraseña del usuario root
          database: 'poseasydte'
        });
      });
    }
    return parsedConfig;  // Retornar la configuración
  } catch (error) {
    console.error('Error fetching config:', error);
    throw error; // Re-throw the error after logging it
  }
}

async function extractAndSaveDataToCsv() {
  try {
    let query, data, csv;
    if (dbType === 'POSMASTER' || dbType === 'GMM') {
      query = dbType === 'POSMASTER' ? `
        SELECT
          M_Productos.CODPROD,
          M_Productos.CODBARRAS,
          M_Productos.DESCRIPCION,
          LP01.PRECIO
        FROM
          M_Productos
        INNER JOIN
          LP01 ON M_Productos.CODPROD = LP01.CODPROD;
      ` : `
        SELECT 
          IdArticulo AS CODPROD, 
          Codigo AS CODBARRAS, 
          Descripcion AS DESCRIPCION, 
          Precio_V AS PRECIO 
        FROM PRODUCTOS;
      `;
      data = await connection.query(query);
    } else if (dbType === 'EASY') {
      await retry(async () => {
        if (!mysqlConnection || mysqlConnection.state === 'disconnected') {
          mysqlConnection = await mysql.createConnection({
            host: ip,  // Usar la IP del config.json
            port: 3306,
            user: 'root',
            password: '', // Reemplaza con la contraseña del usuario root
            database: 'poseasydte'
          });
        }
      });

      query = `
        SELECT
          siproducto.idsiproducto AS CODPROD,
          siproducto.siproductodenominacion AS DESCRIPCION,
          siproductoprecio.siproductoprecioventa AS PRECIO,
          siproductoprecio.siproductocodigobarra AS CODBARRAS
        FROM
          siproducto
        JOIN
          siproductoprecio ON siproducto.idsiproducto = siproductoprecio.idsiproducto;
      `;
      const [rows] = await mysqlConnection.execute(query);
      data = rows;
      data.forEach(item => {
        if (item.PRECIO) {
          item.PRECIO = item.PRECIO.replace(/\.00$/, '');
        }
      });
    }

    if (data) {
      csv = Papa.unparse(data);
      await fs.writeFile(csvFilePath, csv, 'utf-8');
      console.log('Data exported to CSV successfully');
    } else {
      console.log('No data to export to CSV');
    }
  } catch (error) {
    console.error('Error extracting and saving data to CSV:', error);
  }
}

backendApp.get('/products', async (req, res) => {
  try {
    await extractAndSaveDataToCsv();
    const csvData = await fs.readFile(csvFilePath, 'utf-8');
    const { data: jsonData } = Papa.parse(csvData, { header: true });
    const transformedData = jsonData.map(({ CODPROD, CODBARRAS, DESCRIPCION, PRECIO }) => ({
      id: CODPROD,
      barcode: CODBARRAS || CODPROD,  // Usar CODPROD si CODBARRAS está vacío
      name: DESCRIPCION,
      price: PRECIO ? PRECIO.replace(/\.00$/, '') : undefined
    }));
    res.json(transformedData);
  } catch (error) {
    console.error('Error reading CSV file:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

async function startExpressApp() {
  try {
    await extractAndSaveDataToCsv();

    backendApp.listen(PORT, () => {
      console.log(`Express server running at http://localhost:${PORT}`);
    });

    setInterval(extractAndSaveDataToCsv, 5 * 60 * 60 * 1000); // 5 horas en milisegundos
  } catch (error) {
    console.error('Error starting the Express server:', error);
  }
}

function createWindow() {
  let windowOptions = {
    width: 1000,
    height: 800,
    show: false,
    autoHideMenuBar: app.isPackaged,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  };

  if (!app.isPackaged) {
    windowOptions = {
      ...windowOptions,
      width: 1024,
      height: 768,
      autoHideMenuBar: false
    };
  }
  const mainWindow = new BrowserWindow(windowOptions);

  mainWindow.on('ready-to-show', () => {
    if (app.isPackaged) {
      mainWindow.maximize();
    }
    mainWindow.show();
  });

  backendApp.post('/registerProducts', async (req, res) => {
    try {
      const productsToRegister = req.body;
      const batchId = uuidv4(); // Generar un ID único para este lote de productos
      const productRecords = productsToRegister.map((product) => {
        const timestamp = new Date().toLocaleString();
        return `${batchId},${product.name},${product.barcode},${product.price},${timestamp}`;
      });
      const csvData = productRecords.join('\n') + '\n';
      await fs.appendFile(registrosFilePath, csvData, 'utf-8');
      console.log('Productos registrados en el archivo CSV correctamente');
      res.sendStatus(200);
    } catch (error) {
      console.error('Error al registrar productos en el archivo CSV:', error);
      res.status(500).send('Error al registrar productos');
    }
  });

  backendApp.use('/csv', express.static('C:/PosMasterDTE/Bdatos'));

  backendApp.get('/historial', async (req, res) => {
    try {
      const csvFilePathR = 'C:/PosMasterDTE/Bdatos/registros.csv';
      const csvData = await fs.readFile(csvFilePathR, 'utf-8');
      const { data: jsonData } = Papa.parse(csvData, { header: true });
  
      const lotes = jsonData.reduce((acc, item) => {
        const loteId = item.id;
        if (!acc[loteId]) {
          acc[loteId] = [];
        }
        acc[loteId].push(item);
        return acc;
      }, {});
  
      res.json(Object.values(lotes));
    } catch (error) {
      console.error('Error leyendo CSV:', error);
      res.status(500).json({ error: 'Error en el historial' });
    }
  });
  
  

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  ipcMain.handle('print', async (event, args) => {
    const { data, options } = args;
    let config;

    try {
      config = await getConfig();  // Obtener la configuración
    } catch (error) {
      console.error('Error in getConfig:', error);
      return;
    }

    // Usar las opciones habilitar impresoras según la configuración
    if (config.habilitar80x80 && options.printerSize === '80x80') {
      // Configuración para la impresora 80x80
      // ...
    }
    if (config.habilitar50x30 && options.printerSize === '50x30') {
      // Configuración para la impresora 50x30
      // ...
    }
    if (config.habilitar58x44 && options.printerSize === '58x44') {
      // Configuración para la impresora 58x44
      // ...
    }
    if (config.habilitar100x50 && options.printerSize === '100x50') {
      // Configuración para la impresora 100x50
      // ...
    }

    try {
      await PosPrinter.print(data, options);
      console.log('Impresión exitosa');
    } catch (error) {
      console.error('Error en la impresión', error);
    }
  });

  // Nueva función para obtener la lista de impresoras
  ipcMain.handle('getPrinters', async () => {
    try {
      const { stdout } = await execAsync('wmic printer get name');
      const printers = stdout.split('\n').slice(1).map(line => line.trim()).filter(line => line);
      return printers;
    } catch (error) {
      console.error('Error fetching printers:', error);
      throw error;
    }
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
          { role: 'togglefullscreen', label: 'Alternar pantalla completa' }
        ],
      },
    ]);

    Menu.setApplicationMenu(devMenu);
  } else {
    Menu.setApplicationMenu(null);
  }
};

ipcMain.handle('close-app', () => {
  app.quit();
});

ipcMain.handle('reload-app', () => {
  app.relaunch();
  app.exit();
});

ipcMain.handle('readConfig', async (event, isPackaged) => {
  const basePath = isPackaged ? '../../../app.asar.unpacked/resources/' : '../../resources/';
  const configPath = join(__dirname, basePath, 'config.json');
  const unparsedConfig = await fs.readFile(configPath, 'utf-8');
  return JSON.parse(unparsedConfig);
});

ipcMain.handle('writeConfig', async (event, configData, isPackaged) => {
  const basePath = isPackaged ? '../../../app.asar.unpacked/resources/' : '../../resources/';
  const configPath = join(__dirname, basePath, 'config.json');
  await fs.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf-8');
  return true;
});

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron');

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  await getConfig().catch(error => {
    console.error('Error in getConfig:', error);
  });
  await startExpressApp().catch(error => {
    console.error('Error in startExpressApp:', error);
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
