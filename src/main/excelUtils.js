const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelFilePath = path.join(__dirname, '../../data/peluqueria.xlsx');

const loadWorkbook = () => {
  if (fs.existsSync(excelFilePath)) {
    return XLSX.readFile(excelFilePath);
  } else {
    const wb = XLSX.utils.book_new();
    XLSX.writeFile(wb, excelFilePath);
    return wb;
  }
};

const saveWorkbook = (workbook) => {
  XLSX.writeFile(workbook, excelFilePath);
};

const writeDataToSheet = (sheetName, data) => {
  const workbook = loadWorkbook();
  const worksheet = XLSX.utils.json_to_sheet(data);
  if (workbook.SheetNames.includes(sheetName)) {
    XLSX.utils.book_remove_sheet(workbook, sheetName);
  }
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  saveWorkbook(workbook);
};

const readDataFromSheet = (sheetName) => {
  const workbook = loadWorkbook();
  const worksheet = workbook.Sheets[sheetName];
  return worksheet ? XLSX.utils.sheet_to_json(worksheet) : [];
};

module.exports = {
  writeDataToSheet,
  readDataFromSheet,
};
