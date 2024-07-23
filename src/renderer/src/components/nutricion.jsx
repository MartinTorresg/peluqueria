import React, { useState, useEffect } from 'react';
import { PrintQueue } from '../utils/PrintQueue';

const Nutricion = ({ isOpen, handleClose, handleSaveToHistory, initialData }) => {
  const [nutritionData, setNutritionData] = useState({
    productName: '',
    barcode: '',
    servingSize: '',
    calories: '',
    totalFat: '',
    saturatedFat: '',
    transFat: '',
    cholesterol: '',
    sodium: '',
    dietaryFiber: '',
    sugars: '',
    protein: '',
    vitaminA: '',
    vitaminC: '',
    calcium: '',
    iron: '',
    resolution: '',
    manufactureDate: '', // nuevo campo
    expirationDate: '' // nuevo campo
  });
  const [copies, setCopies] = useState(1);
  const [printerName, setPrinterName] = useState('');

  const printQueue = new PrintQueue();

  useEffect(() => {
    if (initialData) {
      setNutritionData(initialData);
    }
  }, [initialData]);

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

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNutritionData({ ...nutritionData, [name]: value });
  };

  const handlePrint = async () => {
    const defaultNutritionData = Object.keys(nutritionData).reduce((acc, key) => {
      acc[key] = nutritionData[key] || '0';
      return acc;
    }, {});

    const caloriesFromFat = (defaultNutritionData.totalFat * 9).toFixed(2);
    const totalCarbohydrate = (parseFloat(defaultNutritionData.dietaryFiber) + parseFloat(defaultNutritionData.sugars)).toFixed(2);

    const printData = [
      {
        type: 'text',
        value: defaultNutritionData.productName,
        style: { textAlign: 'center', fontSize: 14, fontWeight: 'bold', marginBottom: 4, fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: 'Datos de Nutrición',
        style: { textAlign: 'center', fontSize: 14, fontWeight: 'bold', marginBottom: 4, fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Grasa total: ${defaultNutritionData.totalFat}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Grasa saturada: ${defaultNutritionData.saturatedFat}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Grasas trans: ${defaultNutritionData.transFat}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Colesterol: ${defaultNutritionData.cholesterol}mg`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Sodio: ${defaultNutritionData.sodium}mg`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Carbohidratos totales: ${totalCarbohydrate}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Fibra dietética: ${defaultNutritionData.dietaryFiber}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Azúcares: ${defaultNutritionData.sugars}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Proteínas: ${defaultNutritionData.protein}g`,
        style: { textAlign: 'left', fontSize: 13, margin: '2px 0', fontFamily: 'Arial', marginTop: '-5px' }
      },
      {
        type: 'text',
        value: `Tamaño de la porción: ${defaultNutritionData.servingSize}g`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-18px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Calorías de grasa: ${caloriesFromFat}`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-26px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Calorías: ${defaultNutritionData.calories}`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-28px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Hierro: ${defaultNutritionData.iron}%`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-28px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Calcio: ${defaultNutritionData.calcium}%`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-28px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Vitamina C: ${defaultNutritionData.vitaminC}%`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-30px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Vitamina A: ${defaultNutritionData.vitaminA}%`,
        style: { textAlign: 'right', fontSize: 13, margin: '2px 0', marginRight: '20px', marginTop: '-28px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Cantidad por porcion`,
        style: { textAlign: 'right', fontWeight: 'bold', fontSize: 12, margin: '2px 0', marginRight: '20px', marginTop: '-26px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `ELAB: ${defaultNutritionData.manufactureDate} - VENC: ${defaultNutritionData.expirationDate}`,
        style: { textAlign: 'right', fontWeight: 'bold', fontSize: 11, margin: '2px 0', marginRight: '20px', marginTop: '85px', fontFamily: 'Arial' }
      },
      {
        type: 'text',
        value: `Resolución: ${defaultNutritionData.resolution}`,
        style: { textAlign: 'right', fontWeight: 'bold', fontSize: 14, margin: '2px 0', marginRight: '20px', marginTop: '5px', fontFamily: 'Arial' }
      },
      {
        type: 'barCode',
        value: defaultNutritionData.barcode,
        height: 15,
        width: 2,
        displayValue: true,
        fontsize: 14,
        position: 'left',
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

    for (let i = 0; i < copies; i++) {
      printQueue.enqueue({ data: printData, options });
    }

    handleSaveToHistory(defaultNutritionData);
  };

  const placeholders = {
    productName: 'Ingresa el nombre del producto',
    barcode: 'Ingresa el código de barras',
    servingSize: 'Ingresa el tamaño de la porción (g)',
    calories: 'Ingresa las calorías',
    totalFat: 'Ingresa la grasa total (g)',
    saturatedFat: 'Ingresa la grasa saturada (g)',
    transFat: 'Ingresa las grasas trans (g)',
    cholesterol: 'Ingresa el colesterol (mg)',
    sodium: 'Ingresa el sodio (mg)',
    dietaryFiber: 'Ingresa la fibra dietética (g)',
    sugars: 'Ingresa los azúcares (g)',
    protein: 'Ingresa las proteínas (g)',
    vitaminA: 'Ingresa la vitamina A (%)',
    vitaminC: 'Ingresa la vitamina C (%)',
    calcium: 'Ingresa el calcio (%)',
    iron: 'Ingresa el hierro (%)',
    resolution: 'Ingresa la resolución',
    manufactureDate: 'Ingresa la fecha de elaboración',
    expirationDate: 'Ingresa la fecha de vencimiento'
  };

  const tooltips = {
    productName: 'Nombre descriptivo del producto',
    barcode: 'Código de barras del producto',
    servingSize: 'Cantidad total de producto en gramos',
    calories: 'Calorías totales por porción',
    totalFat: 'Gramos de grasa total por porción',
    saturatedFat: 'Gramos de grasa saturada por porción',
    transFat: 'Gramos de grasas trans por porción',
    cholesterol: 'Miligramos de colesterol por porción',
    sodium: 'Miligramos de sodio por porción',
    dietaryFiber: 'Gramos de fibra dietética por porción',
    sugars: 'Gramos de azúcares por porción',
    protein: 'Gramos de proteínas por porción',
    vitaminA: 'Porcentaje de vitamina A diario recomendado',
    vitaminC: 'Porcentaje de vitamina C diario recomendado',
    calcium: 'Porcentaje de calcio diario recomendado',
    iron: 'Porcentaje de hierro diario recomendado',
    resolution: 'Resolución específica del producto',
    manufactureDate: 'Fecha de elaboración del producto',
    expirationDate: 'Fecha de vencimiento del producto'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={handleClose}>
      <div className="bg-white p-4 rounded-lg shadow-lg max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-row justify-between mb-4">
          <h2 className="text-black font-semibold text-lg">{nutritionData.productName || 'Ingrese el nombre del producto'}</h2>
          <button
            onClick={handleClose}
            className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700"
          >
            Cerrar
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col gap-4">
            <h3 className="text-black font-semibold text-md">Datos del Producto</h3>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.productName}</label>
              <input
                type="text"
                name="productName"
                value={nutritionData.productName}
                onChange={handleChange}
                placeholder={placeholders.productName}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.productName}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.barcode}</label>
              <input
                type="text"
                name="barcode"
                value={nutritionData.barcode}
                onChange={handleChange}
                placeholder={placeholders.barcode}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.barcode}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.servingSize}</label>
              <input
                type="text"
                name="servingSize"
                value={nutritionData.servingSize}
                onChange={handleChange}
                placeholder={placeholders.servingSize}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.servingSize}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.calories}</label>
              <input
                type="text"
                name="calories"
                value={nutritionData.calories}
                onChange={handleChange}
                placeholder={placeholders.calories}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.calories}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-black font-semibold text-md">Datos de Nutrición</h3>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.totalFat}</label>
              <input
                type="text"
                name="totalFat"
                value={nutritionData.totalFat}
                onChange={handleChange}
                placeholder={placeholders.totalFat}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.totalFat}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.saturatedFat}</label>
              <input
                type="text"
                name="saturatedFat"
                value={nutritionData.saturatedFat}
                onChange={handleChange}
                placeholder={placeholders.saturatedFat}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.saturatedFat}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.transFat}</label>
              <input
                type="text"
                name="transFat"
                value={nutritionData.transFat}
                onChange={handleChange}
                placeholder={placeholders.transFat}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.transFat}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.cholesterol}</label>
              <input
                type="text"
                name="cholesterol"
                value={nutritionData.cholesterol}
                onChange={handleChange}
                placeholder={placeholders.cholesterol}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.cholesterol}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.sodium}</label>
              <input
                type="text"
                name="sodium"
                value={nutritionData.sodium}
                onChange={handleChange}
                placeholder={placeholders.sodium}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.sodium}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.dietaryFiber}</label>
              <input
                type="text"
                name="dietaryFiber"
                value={nutritionData.dietaryFiber}
                onChange={handleChange}
                placeholder={placeholders.dietaryFiber}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.dietaryFiber}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.sugars}</label>
              <input
                type="text"
                name="sugars"
                value={nutritionData.sugars}
                onChange={handleChange}
                placeholder={placeholders.sugars}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.sugars}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.protein}</label>
              <input
                type="text"
                name="protein"
                value={nutritionData.protein}
                onChange={handleChange}
                placeholder={placeholders.protein}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.protein}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-black font-semibold text-md">Cantidad por Porción</h3>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.vitaminA}</label>
              <input
                type="text"
                name="vitaminA"
                value={nutritionData.vitaminA}
                onChange={handleChange}
                placeholder={placeholders.vitaminA}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.vitaminA}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.vitaminC}</label>
              <input
                type="text"
                name="vitaminC"
                value={nutritionData.vitaminC}
                onChange={handleChange}
                placeholder={placeholders.vitaminC}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.vitaminC}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.calcium}</label>
              <input
                type="text"
                name="calcium"
                value={nutritionData.calcium}
                onChange={handleChange}
                placeholder={placeholders.calcium}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.calcium}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.iron}</label>
              <input
                type="text"
                name="iron"
                value={nutritionData.iron}
                onChange={handleChange}
                placeholder={placeholders.iron}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.iron}
              />
            </div>
            
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-black font-semibold text-md">Fechas del Producto</h3>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.manufactureDate}</label>
              <input
                type="date"
                name="manufactureDate"
                value={nutritionData.manufactureDate}
                onChange={handleChange}
                placeholder={placeholders.manufactureDate}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.manufactureDate}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.expirationDate}</label>
              <input
                type="date"
                name="expirationDate"
                value={nutritionData.expirationDate}
                onChange={handleChange}
                placeholder={placeholders.expirationDate}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.expirationDate}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-gray-700 mb-1">{placeholders.resolution}</label>
              <input
                type="text"
                name="resolution"
                value={nutritionData.resolution}
                onChange={handleChange}
                placeholder={placeholders.resolution}
                className="w-full p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                title={tooltips.resolution}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-4">
          <div className="flex items-center">
            <label className="mr-2 text-gray-700">Copias:</label>
            <input
              type="number"
              value={copies}
              onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
              min="1"
              className="w-16 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <button
            onClick={handlePrint}
            className="p-2 rounded bg-blue-700 font-bold text-white"
          >
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
};

export default Nutricion;
