const ExcelJS = require('exceljs');
const path = require('path');

// Define la ruta del archivo de Excel
const filePath = path.join(__dirname, '../../data/clientes.xlsx');

// Función para leer datos de una hoja de Excel
const readDataFromSheet = async (sheetName) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(sheetName);
  
  if (!worksheet) {
    console.log(`Worksheet ${sheetName} not found`);
    return [];
  }

  const data = [];
  worksheet.eachRow((row, rowNumber) => {
    const rowData = row.values.slice(1); // Omitir el primer elemento vacío
    data.push(rowData);
  });

  return data;
};

// Función para escribir datos en una hoja de Excel
const writeDataToSheet = async (sheetName, data) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  let worksheet = workbook.getWorksheet(sheetName);
  
  if (!worksheet) {
    worksheet = workbook.addWorksheet(sheetName);
  }

  worksheet.clear();
  data.forEach((item, index) => {
    worksheet.addRow(item);
  });

  await workbook.xlsx.writeFile(filePath);
};

// Exportar las funciones para que puedan ser usadas en otros archivos
module.exports = {
  readDataFromSheet,
  writeDataToSheet,
};
