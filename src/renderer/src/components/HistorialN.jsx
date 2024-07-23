import React, { useState, useEffect } from 'react';
import { PrintQueue } from '../utils/PrintQueue';
import * as XLSX from 'xlsx';

const HistorialN = ({ isOpen, handleClose, onEdit }) => {
  const [history, setHistory] = useState([]);
  const [printerName, setPrinterName] = useState('');
  const printQueue = new PrintQueue();

  useEffect(() => {
    const storedHistory = localStorage.getItem('nutritionHistory');
    if (storedHistory) {
      setHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const isPackaged = import.meta.env.PROD;
        const config = await window.electron.invoke('readConfig', isPackaged);
        setPrinterName(config.Print100x50?.customPrint || 'DefaultPrinterName');
      } catch (error) {
        console.error('Error loading config:', error);
      }
    }
    fetchConfig();
  }, []);

  const handleDelete = (index) => {
    const newHistory = [...history];
    newHistory.splice(index, 1);
    setHistory(newHistory);
    localStorage.setItem('nutritionHistory', JSON.stringify(newHistory));
  };

  const handleClearAll = () => {
    setHistory([]);
    localStorage.removeItem('nutritionHistory');
  };

  const handleReprint = (item) => {
    const defaultItem = Object.keys(item).reduce((acc, key) => {
      acc[key] = item[key] || '0';
      return acc;
    }, {});

    const caloriesFromFat = (defaultItem.totalFat * 9).toFixed(2);
    const totalCarbohydrate = (parseFloat(defaultItem.dietaryFiber) + parseFloat(defaultItem.sugars)).toFixed(2);

    const printData = [
      {
        type: 'text',
        value: defaultItem.productName,
        style: { textAlign: 'center', fontSize: 14, fontWeight: 'bold', marginBottom: 4, fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: 'Datos de Nutrición',
        style: { textAlign: 'center', fontSize: 14, fontWeight: 'bold', marginBottom: 4, fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Grasa total: ${defaultItem.totalFat}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Grasa saturada: ${defaultItem.saturatedFat}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Grasas trans: ${defaultItem.transFat}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Colesterol: ${defaultItem.cholesterol}mg`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Sodio: ${defaultItem.sodium}mg`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Carbohidratos totales: ${totalCarbohydrate}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Fibra dietética: ${defaultItem.dietaryFiber}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Azúcares: ${defaultItem.sugars}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Proteínas: ${defaultItem.protein}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Tamaño de la porción: ${defaultItem.servingSize}g`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-18px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Calorías de grasa: ${caloriesFromFat}`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-26px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Calorías: ${defaultItem.calories}`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-28px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Hierro: ${defaultItem.iron}%`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-28px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Calcio: ${defaultItem.calcium}%`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-28px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Vitamina C: ${defaultItem.vitaminC}%`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-30px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Vitamina A: ${defaultItem.vitaminA}%`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-28px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Cantidad por porcion`,
        style: { textAlign: 'right', fontWeight: 'bold', fontSize: 12, margin: '2px 0', marginRight: '20px', marginTop: '-26px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `ELAB: ${defaultItem.manufactureDate} - VENC: ${defaultItem.expirationDate}`,
        style: { textAlign: 'right', fontWeight: 'bold', fontSize: 11, margin: '2px 0', marginRight: '20px', marginTop: '85px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Resolución: ${defaultItem.resolution}`,
        style: { textAlign: 'right', fontWeight: 'bold', fontSize: 14, margin: '2px 0', marginRight: '20px', marginTop: '5px', fontFamily: 'Arial' }
      },
      {
        type: 'barCode',
        value: defaultItem.barcode,
        height: 15,
        width: 2,
        displayValue: true,
        fontsize: 14,
        style: {
          marginTop: '-8px'
        }
      }
    ];

    const options = {
      preview: false,
      silent: true,
      printerName: printerName,
      margin: '0 0 0 0',
      timeOutPerLine: 400,
      pageSize: { height: 1000, width: 500 }
    };

    printQueue.enqueue({ data: printData, options });
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(history);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial');
    XLSX.writeFile(workbook, 'historial_nutricion.xlsx');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const importedData = XLSX.utils.sheet_to_json(firstSheet);
        setHistory(importedData);
        localStorage.setItem('nutritionHistory', JSON.stringify(importedData));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={handleClose}>
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-5xl w-full h-3/4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-row justify-between mb-4">
          <h2 className="text-black font-semibold text-lg">Historial de etiquetas de nutrición</h2>
          <button
            onClick={handleClose}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700"
          >
            Cerrar
          </button>
        </div>
        <div className="flex justify-between mb-4">
          <button onClick={handleExport} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Exportar Historial
          </button>
          <input type="file" accept=".xlsx, .xls" onChange={handleImport} className="bg-white text-black py-2 px-4 rounded" />
        </div>

        {history.length === 0 ? (
          <p>No hay etiquetas en el historial.</p>
        ) : (
          <ul className="list-disc list-inside">
            {history.map((item, index) => (
              <li key={index} className="mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-black">{item.productName}</span>
                  <div className="flex space-x-2 items-center">
                    <span className="text-gray-500 text-sm">{item.date}</span>
                    <button
                      onClick={() => onEdit(item)}
                      className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleReprint(item)}
                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                    >
                      Reimprimir
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistorialN;
