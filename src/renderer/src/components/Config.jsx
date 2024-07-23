import React, { useState, useEffect } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';

const Config = ({ onClose }) => {
  const [formData, setFormData] = useState({});
  const [tipoBD, setTipoBD] = useState('');
  const [printerOptions, setPrinterOptions] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [printHistoryEmpty, setPrintHistoryEmpty] = useState(true);
  const [nutritionHistoryEmpty, setNutritionHistoryEmpty] = useState(true);

  const schema = {
    title: 'Configuracion',
    type: 'object',
    definitions: {
      printerProperties: {
        type: 'object',
        properties: {
          customPrint: { type: 'string', title: 'Nombre de impresora', enum: printerOptions },
          customfontSizeCustomer: { type: 'string', title: 'Tamaño nombre de local' },
          customPageMaxWidth: { type: 'string', title: 'Tamaño máximo ancho de página' },
          customPageWidth: { type: 'string', title: 'Ancho de página' },
          customfontSizePrice: { type: 'string', title: 'Tamaño texto precio' },
          customHeightPrice: { type: 'string', title: 'Alto de texto precio' },
          customfontSizeName: { type: 'string', title: 'Tamaño texto nombre' },
          customHeightName: { type: 'string', title: 'Alto de texto nombre' },
          barCodeHeight: { type: 'number', title: 'Altura del código de barras' },
          barCodeWidth: { type: 'number', title: 'Ancho del código de barras' },
          barCodeFontSize: { type: 'number', title: 'Tamaño de fuente del código de barras' },
          pageProperties: {
            type: 'object',
            title: '',
            description: 'Ajustes de impresión',
            properties: {
              printPageWidth: { type: 'number', title: 'Ancho de página impresa' },
              printPageHeight: { type: 'number', title: 'Alto de página impresa' }
            }
          },
          usePageSizeMM: {
            title: 'Utilizar Page Size mm?',
            type: 'string',
            enum: ['Si', 'No']
          },
          pagePropertiesSize: {
            type: 'string',
            title: 'Tamaño página',
            description: '(80mm | 78mm | 76mm | 57mm | 58mm | 44mm)'
          }
        }
      }
    },
    properties: {
      PosMasterDTE_DIR: { type: 'string', title: 'Ruta MDB (ejemplo C:/PosMasterDTE/Bdatos/)', default: '' },
      CustomCustomer: { type: 'string', title: 'Nombre Local' },
      tipoBD: {
        type: 'string',
        title: 'Tipo de Base de Datos',
        enum: ['POSMASTER', 'GMM', 'EASY']
      },
      ip: {
        type: 'string',
        title: 'IP de la Base de Datos',
        default: '127.0.0.1'
      },
      mostrarBotonesNutricion: {
        type: 'string',
        title: 'Mostrar Botones de Nutrición',
        enum: ['Si', 'No'],
        default: 'Si'
      },
      habilitar80x80: { type: 'boolean', title: 'Habilitar 80x80mm' },
      habilitar50x30: { type: 'boolean', title: 'Habilitar 50x30mm' },
      habilitar58x44: { type: 'boolean', title: 'Habilitar 58x44mm' },
      habilitar100x50: { type: 'boolean', title: 'Habilitar 100x50mm' },
      Print50x30: {
        type: 'object',
        title: 'Impresora 50x30mm',
        allOf: [{ $ref: '#/definitions/printerProperties' }]
      },
      Print58x44: {
        type: 'object',
        title: 'Impresora 50x44mm',
        allOf: [{ $ref: '#/definitions/printerProperties' }]
      },
      Print80x80: {
        type: 'object',
        title: 'Impresora 80x80mm',
        allOf: [{ $ref: '#/definitions/printerProperties' }]
      },
      Print100x50: {
        type: 'object',
        title: 'Impresora 100x50mm',
        allOf: [{ $ref: '#/definitions/printerProperties' }]
      }
    }
  };

  const baseUiSchema = {
    csvFilePath: {
      'ui:widget': 'text'
    },
    ip: {
      'ui:widget': 'hidden'
    },
    'ui:submitButtonOptions': {
      norender: true
    }
  };

  const [uiSchema, setUiSchema] = useState(baseUiSchema);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const isPackaged = import.meta.env.PROD;
        const config = await window.electron.invoke('readConfig', isPackaged);
        setFormData(config);
        setTipoBD(config.tipoBD || '');
      } catch (error) {
        console.error('Error loading config:', error);
        alert('Error al cargar la configuración.');
      }
    }
    fetchConfig();
  }, []);

  useEffect(() => {
    async function fetchPrinters() {
      try {
        const printers = await window.electron.invoke('getPrinters');
        setPrinterOptions(printers);
      } catch (error) {
        console.error('Error fetching printers:', error);
        alert('Error al obtener la lista de impresoras.');
      }
    }
    fetchPrinters();
  }, []);

  useEffect(() => {
    const updatedUiSchema = { ...baseUiSchema };
    if (tipoBD === 'EASY') {
      updatedUiSchema.ip['ui:widget'] = 'text';
    } else {
      updatedUiSchema.ip['ui:widget'] = 'hidden';
    }
    setUiSchema(updatedUiSchema);
  }, [tipoBD]);

  useEffect(() => {
    const printHistory = localStorage.getItem('historialImpresion');
    const nutritionHistory = localStorage.getItem('nutritionHistory');
    setPrintHistoryEmpty(!printHistory);
    setNutritionHistoryEmpty(!nutritionHistory);
  }, []);

  const saveJsonContent = async () => {
    const isPackaged = import.meta.env.PROD;
    console.log(formData);
    try {
      await window.electron.invoke('writeConfig', formData, isPackaged);
      alert('Configuración guardada exitosamente.');
      window.electron.invoke('reload-app');
    } catch (error) {
      console.error('Error saving config:', error);
      alert(
        `Error al guardar la configuración: el JSON tiene una sintaxis incorrecta. \n${error.message}`
      );
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setShowPasswordError(false);
    } else {
      setShowPasswordError(true);
    }
  };

  const clearPrintHistory = () => {
    localStorage.removeItem('historialImpresion');
    setPrintHistoryEmpty(true);
  };

  const clearNutritionHistory = () => {
    localStorage.removeItem('nutritionHistory');
    setNutritionHistoryEmpty(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-black font-semibold text-lg mb-4">Ingrese la contraseña</h2>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4 text-black"
              placeholder="Contraseña"
            />
            {showPasswordError && (
              <p className="text-red-500 mb-4">Contraseña incorrecta. Inténtelo de nuevo.</p>
            )}
            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-blue-600 font-bold text-white p-2 rounded"
              >
                Ingresar
              </button>
              <button
                type="button"
                className="bg-red-600 font-bold text-white p-2 rounded"
                onClick={onClose}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="text-black bg-gray-50 p-2 rounded max-w-[50vw] absolute">
      <p className="font-bold text-2xl text-center py-1">Menu de configuración</p>
      <p className="text-center">
        Si por alguna razón se abre esta pantalla y no eres un desarrollador, por favor selecciona
        cancelar ya que modificar estas opciones podrían dejar el software inutilizable.
      </p>
      <Form
        className="max-h-[70vh] max-w-[50vw] overflow-auto px-2"
        schema={schema}
        formData={formData}
        uiSchema={uiSchema}
        validator={validator}
        onChange={({ formData }) => {
          setFormData(formData);
          setTipoBD(formData.tipoBD);
        }}
      />
      <div className="flex flex-row justify-between mx-5 my-4">
        <div
          className="bg-blue-600 font-bold text-white p-2 rounded cursor-pointer"
          onClick={() => {
            saveJsonContent();
            if (onClose) onClose(); // Cierra el formulario después de guardar
          }}
        >
          Guardar
        </div>
        <div
          className="bg-red-600 font-bold text-white p-2 rounded cursor-pointer"
          onClick={() => {
            if (onClose) onClose(); // Llama a onClose cuando el usuario quiere cerrar sin guardar
          }}
        >
          Cancelar
        </div>
      </div>
      <div className="flex flex-row justify-between mx-5 my-4">
        <button
          className={`font-bold text-white p-2 rounded cursor-pointer ${printHistoryEmpty ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600'}`}
          onClick={clearPrintHistory}
          disabled={printHistoryEmpty}
        >
          Borrar Historial de Impresión
        </button>
        <button
          className={`font-bold text-white p-2 rounded cursor-pointer ${nutritionHistoryEmpty ? 'bg-gray-400 cursor-not-allowed' : 'bg-yellow-600'}`}
          onClick={clearNutritionHistory}
          disabled={nutritionHistoryEmpty}
        >
          Borrar Historial de Nutrición
        </button>
      </div>
    </div>
  );
};

export default Config;
