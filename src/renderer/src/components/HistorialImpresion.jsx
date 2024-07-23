import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const HistorialImpresion = ({ isOpen, handleClose, onSelectProducts }) => {
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const storedHistorial = localStorage.getItem('historialImpresion');
      if (storedHistorial) {
        setHistorial(JSON.parse(storedHistorial));
      }
    }
  }, [isOpen]);

  const handleSelectLote = (lote) => {
    onSelectProducts(lote.products || []);
    handleClose();
  };

  const handleDelete = (id) => {
    const newHistorial = historial.filter((lote) => lote.id !== id);
    setHistorial(newHistorial);
    localStorage.setItem('historialImpresion', JSON.stringify(newHistorial));
  };

  const handleClearAll = () => {
    setHistorial([]);
    localStorage.removeItem('historialImpresion');
  };

  const handleExport = () => {
    const worksheetData = [];

    worksheetData.push(["REPORTE DE IMPRESIONES"]);
    worksheetData.push([]);

    historial.forEach((lote, index) => {
      worksheetData.push([`Impresion ${lote.id} - ${lote.date}`]);
      (lote.products || []).forEach((product) => {
        worksheetData.push([product.name]);
      });
      worksheetData.push([]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'HistorialImpresion');

    // Convert the worksheet to binary string
    const workbookBinary = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });

    // Create a Blob with the binary string
    const workbookBlob = new Blob([s2ab(workbookBinary)], { type: 'application/octet-stream' });

    // Download the Blob as an Excel file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(workbookBlob);
    link.download = 'reporte_impresiones.xlsx';
    link.click();
  };

  // Helper function to convert string to ArrayBuffer
  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
    return buf;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={handleClose}>
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-5xl w-full h-3/4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-row justify-between mb-4">
          <h2 className="text-black font-semibold text-lg">Historial de impresión</h2>
          <button
            onClick={handleClose}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700"
          >
            Cerrar
          </button>
        </div>
        <div className="flex justify-between mb-4">
          <button onClick={handleExport} className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Exportar Reporte
          </button>
        </div>

        {historial.length === 0 ? (
          <p>No hay registros en el historial.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {historial.map((lote, index) => (
              <div key={index} className="p-4 border border-black rounded-lg bg-white">
                <h3 className="text-black font-semibold mb-2">Impresión número {lote.id} - {lote.date}</h3>
                <ul className="list-disc list-inside">
                  {(lote.products || []).map((item, i) => (
                    <li key={i} className="mb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-black">{item.name}</span>
                        <span className="text-gray-500 text-sm">{item.price}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelectLote(lote)}
                  className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600 mt-2"
                >
                  Seleccionar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialImpresion;
