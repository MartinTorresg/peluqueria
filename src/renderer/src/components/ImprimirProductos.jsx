import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const ImprimirProductos = ({ printDialogOpen, handlePrintDialogClose, handlePrint }) => {
  const [config, setConfig] = useState({});

  useEffect(() => {
    async function fetchConfig() {
      try {
        const isPackaged = import.meta.env.PROD;
        const configData = await window.electron.invoke('readConfig', isPackaged);
        setConfig(configData);
      } catch (error) {
        console.error('Error loading config:', error);
      }
    }
    fetchConfig();
  }, []);

  const handleCloseAndPrint = (size) => {
    handlePrint(size); // Maneja la impresión
    handlePrintDialogClose(); // Cierra el diálogo
  };

  return (
    <Dialog onClose={handlePrintDialogClose} open={printDialogOpen} maxWidth="md">
      <DialogTitle>Seleccionar tamaño</DialogTitle>
      <DialogContent className="flex flex-row justify-center">
        <div className="flex flex-col items-center">
          {config.habilitar50x30 && (
            <button
              color="primary"
              className="m-2.5 bg-blue-800 text-white p-2 rounded"
              onClick={() => handleCloseAndPrint('50x30')}
            >
              50MM X 30MM
            </button>
          )}
          {config.habilitar58x44 && (
            <button
              className="m-2.5 bg-blue-800 text-white p-2 rounded"
              onClick={() => handleCloseAndPrint('58x44')}
            >
              58MM X 44MM
            </button>
          )}
          {config.habilitar80x80 && (
            <button
              color="primary"
              className="m-2.5 bg-blue-800 text-white p-2 rounded"
              onClick={() => handleCloseAndPrint('80x80')}
            >
              80MM X 80MM
            </button>
          )}
          {config.habilitar100x50 && (
            <button
              color="primary"
              className="m-2.5 bg-blue-800 text-white p-2 rounded"
              onClick={() => handleCloseAndPrint('100x50')}
            >
              100MM X 50MM
            </button>
          )}
        </div>
      </DialogContent>
      <DialogActions className="justify-between">
        <button
          onClick={handlePrintDialogClose}
          color="primary"
          className="m-2.5 bg-red-800 text-white p-2 rounded font-bold"
        >
          Cerrar
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default ImprimirProductos;
