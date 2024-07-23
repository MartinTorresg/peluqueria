import React, { useState, useEffect, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import ImprimirProductos from './components/ImprimirProductos';
import ProductosSeleccionados from './components/ProductosSeleccionados';
import ListaProductos from './components/ListaProductos';
import { PrintQueue } from './utils/PrintQueue';
import logo from './assets/logo.png';
import mrpos from './assets/mrpos.png';
import ManualPrint from './components/manualPrint';
import Registros from './components/Registros';
import HistorialImpresion from './components/HistorialImpresion';
import './App.css';
import { IoSettingsOutline } from 'react-icons/io5';
import Config from './components/Config';
import Nutricion from './components/Nutricion';
import HistorialN from './components/HistorialN';

function App() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [isManualPrintVisible, setIsManualPrintVisible] = useState(false);
  const [isRegistrosVisible, setIsRegistrosVisible] = useState(false);
  const [isHistorialImpresionVisible, setIsHistorialImpresionVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isProductAlreadySelected, setIsProductAlreadySelected] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [isReloadingProducts, setIsReloadingProducts] = useState(false);
  const [isConfigVisible, setIsConfigVisible] = useState(false);
  const [includeBarcode, setIncludeBarcode] = useState(false);
  const [searchBarcode, setSearchBarcode] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isScanningMode, setIsScanningMode] = useState(true);
  const [isNutricionVisible, setIsNutricionVisible] = useState(false);
  const [nutritionDataToEdit, setNutritionDataToEdit] = useState(null);
  const [isHistorialVisible, setIsHistorialVisible] = useState(false);
  const [mostrarBotonesNutricion, setMostrarBotonesNutricion] = useState(true);
  const inputRef = useRef(null);

  const printQueue = new PrintQueue();

  const handleReloadProducts = () => {
    setIsReloadingProducts(true);
    fetch('http://localhost:3300/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setSearch('');
        setIsReloadingProducts(false);
        console.log('Productos recargados:', data);
      })
      .catch((error) => console.error('Error al recargar productos:', error));
  };

  useEffect(() => {
    const handleF5Press = (event) => {
      if (event.key === 'F5' || event.keyCode === 116) {
        event.preventDefault();
        handleReloadProducts();
      }
    };

    window.addEventListener('keydown', handleF5Press);

    return () => {
      window.removeEventListener('keydown', handleF5Press);
    };
  }, [handleReloadProducts]);

  useEffect(() => {
    console.log(products.length);
    if (products.length !== 0) return;
    handleReloadProducts();
  }, []);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const isPackaged = import.meta.env.PROD;
        const config = await window.electron.invoke('readConfig', isPackaged);
        setMostrarBotonesNutricion(config.mostrarBotonesNutricion === 'Si');
      } catch (error) {
        console.error('Error loading config:', error);
      }
    }
    fetchConfig();
  }, []);

  const handleSelectProduct = (product) => {
    if (
      selectedProducts.some(
        (selectedProduct) =>
          selectedProduct.barcode === product.barcode &&
          selectedProduct.name === product.name
      )
    ) {
      setIsProductAlreadySelected(true);
      setShowSnackbar(true);
      setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);
    } else {
      setSelectedProducts([...selectedProducts, { ...product, quantity: 1 }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const foundProduct = products.find((product) => product.barcode === search);

      if (foundProduct) {
        handleSelectProduct(foundProduct);
      } else {
        setShowSnackbar(true);
        setTimeout(() => {
          setShowSnackbar(false);
        }, 3000);
      }
    }
  };

  async function returnConfig() {
    try {
      const isPackaged = import.meta.env.PROD;
      const config = await window.electron.invoke('readConfig', isPackaged);
      return config;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  const handlePrint = async (pageSize) => {
    const config = await returnConfig();
    const { CustomCustomer: customCustomer, ...printConfigs } = config;
  
    let printConfigKey = '';
    switch (pageSize) {
      case '50x30':
        printConfigKey = 'Print50x30';
        break;
      case '58x44':
        printConfigKey = 'Print58x44';
        break;
      case '80x80':
        printConfigKey = 'Print80x80';
        break;
      case '100x50':
        printConfigKey = 'Print100x50';
        break;
      default:
        console.error('Tamaño de página no configurado');
        return;
    }
  
    const {
      pageProperties,
      customfontSizePrice,
      customfontSizeName,
      customPageWidth,
      customHeightPrice,
      customHeightName,
      customPageMaxWidth,
      customPrint,
      customfontSizeCustomer,
      usePageSizeMM,
      pagePropertiesSize,
      barCodeHeight,
      barCodeWidth,
      barCodeFontSize
    } = printConfigs[printConfigKey];
  
    console.log(usePageSizeMM, pagePropertiesSize);
    
    const productsToPrint = selectedProducts.map(product => ({
      name: product.name,
      barcode: product.barcode,
      price: product.price
    }));
  
    // Save the printed products to localStorage with title and date
    const storedHistorial = localStorage.getItem('historialImpresion');
    const historial = storedHistorial ? JSON.parse(storedHistorial) : [];
    const loteId = historial.length + 1;
    const date = new Date();
    const dateString = date.toLocaleDateString('es-CL');
    const timeString = date.toLocaleTimeString('es-CL');
    const newLote = {
      id: loteId,
      date: `${dateString} ${timeString}`,
      products: productsToPrint
    };
    historial.push(newLote);
    localStorage.setItem('historialImpresion', JSON.stringify(historial));
  
    try {
      const response = await fetch('http://localhost:3300/registerProducts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productsToPrint)
      });
  
      if (!response.ok) {
        console.error('Error al registrar productos:', response.statusText);
      }
    } catch (error) {
      console.error('Error al enviar solicitud para registrar productos:', error);
    }
  
    selectedProducts.forEach((product) => {
      for (let i = 0; i < product.quantity; i++) {
        const newValue = includeBarcode ? {
          type: 'barCode',
          value: product.barcode,
          height: barCodeHeight || 10,
          width: barCodeWidth || 1,
          displayValue: true,
          fontsize: barCodeFontSize || 12,
        } : {
          type: 'text',
          value: customCustomer,
          position: 'center',
          style: {
            textAlign: 'center',
            fontSize: customfontSizeCustomer,
            fontWeight: '700',
            fontFamily: 'Arial',
            padding: '15px',
            backgroundColor: 'white',
            color: 'black'
          }
        }
        
        const productData = [
          {
            type: 'text',
            value: `$${Number(product.price).toLocaleString('es-CL')}`,
            position: 'center',
            style: {
              textAlign: 'center',
              fontWeight: '600',
              fontSize: customfontSizePrice,
              fontFamily: 'Arial',
              backgroundColor: 'white',
              marginLeft: '10px',
              color: 'black',
              padding: '1px',
              width: customPageWidth,
              height: customHeightPrice,
              marginTop: '-8px'
            }
          },
          {
            type: 'text',
            value: `${product.name}`,
            position: 'center',
            style: {
              alignItems: 'center',
              textAlign: 'center',
              fontSize: customfontSizeName,
              fontFamily: 'Arial',
              backgroundColor: 'white',
              fontWeight: '500',
              color: 'black',
              marginLeft: '22px',
              margin: '10px',
              padding: '18px',
              width: customPageWidth,
              maxWidth: customPageMaxWidth,
              minHeight: customHeightName,
              height: customHeightName
            }
          }, newValue
        ];
  
        const options = {
          preview: false,
          silent: true,
          printerName: customPrint || 'XP-80C',
          margin: '0 0 0 0',
          timeOutPerLine: 400,
          pageSize: usePageSizeMM === "Si" ? pagePropertiesSize : { height: pageProperties.printPageWidth, width: pageProperties.printPageHeight }
        };
  
        printQueue.enqueue({ data: productData, options });
      }
    });
  }

  useEffect(() => {
    const focusInput = () => {
      if (!open && !isManualPrintVisible && !isConfigVisible && !isHistorialImpresionVisible && inputRef.current) {
        inputRef.current.focus();
      }
    };

    if (!open && !isManualPrintVisible && !isConfigVisible && !isHistorialImpresionVisible) {
      window.addEventListener('click', focusInput);
      window.addEventListener('focus', focusInput);
    }

    return () => {
      window.removeEventListener('click', focusInput);
      window.removeEventListener('focus', focusInput);
    };
  }, [open, isManualPrintVisible, isConfigVisible, isHistorialImpresionVisible]);

  const handleProductScan = (string) => {
    const scannedBarcode = string.trim();

    if (!scannedBarcode) return;

    const foundProduct = products.find(product => product.barcode === scannedBarcode);

    if (foundProduct) {
      handleSelectProduct(foundProduct);
    } else {
      setIsProductAlreadySelected(false);
      setShowSnackbar(true);
      setTimeout(() => {
        setShowSnackbar(false);
      }, 4000);
    }
  };

  const handleSaveToHistory = (nutritionData) => {
    const storedHistory = localStorage.getItem('nutritionHistory');
    const history = storedHistory ? JSON.parse(storedHistory) : [];
    const newHistoryItem = { ...nutritionData, date: new Date().toLocaleString() };
    const newHistory = [...history, newHistoryItem];
    localStorage.setItem('nutritionHistory', JSON.stringify(newHistory));
  };

  const handleEdit = (nutritionData) => {
    setNutritionDataToEdit(nutritionData);
    setIsNutricionVisible(true);
    setIsHistorialVisible(false);
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedProducts = [...selectedProducts];
    updatedProducts[index].quantity = parseInt(quantity);
    setSelectedProducts(updatedProducts);
  };

  const handleHistorialSelect = (lote) => {
    const updatedProducts = [...selectedProducts];
    lote.forEach(product => {
      if (!updatedProducts.some(selectedProduct => selectedProduct.barcode === product.barcode && selectedProduct.name === product.name)) {
        updatedProducts.push({ ...product, quantity: 1 });
      }
    });
    setSelectedProducts(updatedProducts);
  };

  return (
    <>
      <img src={logo} className="absolute top-1.5 left-3 opacity-100 h-[120px]" alt="logo" />
      <img src={mrpos} className="absolute top-8 left-150 opacity-60 h-[80px]" alt="mrpos" />
      <button className="absolute top-14 right-2" onClick={() => setIsConfigVisible(true)}>
        <IoSettingsOutline size="40" />
      </button>

      <div className="grid grid-cols-1 gap-4">
        <div className="flex flex-row items-start space-x-4">
          <div className="flex flex-col absolute left-3 top-36">
            <div className="mb-2 flex space-x-2">
              <button
                onClick={() => setOpen(true)}
                className="bg-blue-700 text-white py-2 px-5 rounded focus:outline-none focus:shadow-outline inline-flex items-center font-bold"
              >
                <SearchIcon className="text-white mr-2" /> Buscar
              </button>
              <button
                onClick={() => setSelectedProducts([])}
                className="bg-blue-700 text-white py-2 px-7 rounded focus:outline-none focus:shadow-outline inline-flex items-center font-bold"
              >
                Limpiar
              </button>
            </div>
            <button
              onClick={() => setIsManualPrintVisible(true)}
              className="bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline text-center font-bold"
            >
              Ingreso manual
            </button>
            <div className="absolute left-0 opacity-100 h-[80px]" style={{ marginTop: '5px', position: 'relative', paddingLeft: '0px', minHeight: '5px' }}>
              <input
                id="includeBarcodeCheckbox"
                type="checkbox"
                checked={includeBarcode}
                onChange={(e) => setIncludeBarcode(e.target.checked)}
                style={{ position: 'absolute', left: '8px', top: '9px', width: '20px', height: '20px' }}
              />
              <label className="bg-blue-700 text-white py-2 px-8 rounded focus:outline-none focus:shadow-outline inline-flex items-center font-bold" htmlFor="includeBarcodeCheckbox" style={{ cursor: 'pointer' }}>
                Incluir Codigo de barras
              </label>
            </div>
            <button
              className="bg-blue-700 text-white py-3 px-4 rounded focus:outline-none focus:shadow-outlineinline-flex text-center font-bold"
              style={{ marginTop: '0px' }}
              onClick={() => setIsHistorialImpresionVisible(true)} // Botón para abrir historial de impresión
            >
              Historial de Impresión
            </button>
            {mostrarBotonesNutricion && (
              <>
                <button
                  className="bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline text-center font-bold"
                  style={{ marginTop: '100px' }}
                  onClick={() => setIsNutricionVisible(true)}
                >
                  Etiqueta de nutrición
                </button>
                <button
                  className="bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline text-center font-bold"
                  style={{ marginTop: '10px' }}
                  onClick={() => setIsHistorialVisible(true)}
                >
                  Historial Nutrición
                </button>
              </>
            )}
          </div>

          <div className="flex-grow">
            <ProductosSeleccionados
              selectedProducts={selectedProducts}
              handleDeleteProduct={(index) => {
                const updatedProducts = [...selectedProducts];
                updatedProducts.splice(index, 1);
                setSelectedProducts(updatedProducts);
              }}
              handleQuantityChange={handleQuantityChange}
            />
          </div>
        </div>

        <div>
          <ListaProductos
            open={open}
            handleClose={() => {
              setOpen(false);
              handleReloadProducts();
            }}
            handleSearch={(e) => {
              setSearch(e.target.value);
            }}
            handleKeyDown={handleKeyDown}
            products={products}
            search={search}
            handleSelectProduct={handleSelectProduct}
          />
          <ManualPrint
            isOpen={isManualPrintVisible}
            handleClose={() => setIsManualPrintVisible(false)}
            handleSelectProduct={handleSelectProduct}
          />
        </div>

        <h1
          onClick={handleReloadProducts}
          className=" p-3 rounded font-bold text-lg absolute bottom-9 left-5"
        >
          {isReloadingProducts ? 'Cargando productos...' : ` F5 - Actualizar productos `}
        </h1>

        <h1 className="font-bold text-lg absolute top-16 right-20">{products.length} Productos cargados</h1>

        <div className="fixed bottom-10 left-0 right-0 mx-auto text-center">
          {isScanningMode && (
            <div className="text-white text-sm mb-2">
              Modo de lectura activado - Escanea un código de barras
            </div>
          )}
          <input
            ref={inputRef}
            className="p-3 rounded font-bold text-lg text-2xl"
            style={{ 
              background: isInputFocused ? '#007BFF' : 'grey', 
              display: 'block', 
              width: '80%', 
              maxWidth: '180px', 
              margin: '0 auto' 
            }}
            value={searchBarcode}
            onChange={(e) => setSearchBarcode(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleProductScan(searchBarcode);
                setSearchBarcode('');
              }
            }}
            onFocus={() => {
              setIsScanningMode(true);
              setIsInputFocused(true);
            }}
            onBlur={() => {
              setIsScanningMode(false);
              setIsInputFocused(false);
            }}
          />
        </div>

        {selectedProducts.length > 0 && (
          <button
            onClick={() => setPrintDialogOpen(true)}
            className="fixed bottom-10 right-2.5 bg-blue-700 text-white text-lg py-3 px-6 w-38 h-12 rounded focus:outline-none focus:shadow-outline"
          >
            Imprimir {selectedProducts.length}
          </button>
        )}

        <ImprimirProductos
          printDialogOpen={printDialogOpen}
          handlePrintDialogClose={() => setPrintDialogOpen(false)}
          handlePrint={handlePrint}
        />

        <div className="snackbar-container">
          <Snackbar
            open={showSnackbar}
            autoHideDuration={4000}
            onClose={() => setShowSnackbar(false)}
            style={{ width: 'auto', maxWidth: '90%', minWidth: '300px' }}
          >
            <MuiAlert
              elevation={6}
              variant="filled"
              severity={isProductAlreadySelected ? "warning" : "error"}
            >
              {isProductAlreadySelected
                ? '¡Este producto ya ha sido seleccionado!'
                : 'Producto no encontrado'}
            </MuiAlert>
          </Snackbar>
        </div>
      </div>
      {isConfigVisible && <Config onClose={() => setIsConfigVisible(false)} />}
      {isNutricionVisible && (
        <Nutricion 
          isOpen={isNutricionVisible} 
          handleClose={() => setIsNutricionVisible(false)} 
          handleSaveToHistory={handleSaveToHistory} 
          initialData={nutritionDataToEdit} 
        />
      )}
      {isHistorialImpresionVisible && (
        <HistorialImpresion 
          isOpen={isHistorialImpresionVisible} 
          handleClose={() => setIsHistorialImpresionVisible(false)}
          onSelectProducts={handleHistorialSelect} 
        />
      )}
      {isHistorialVisible && (
        <HistorialN 
          isOpen={isHistorialVisible} 
          handleClose={() => setIsHistorialVisible(false)}
          onEdit={handleEdit} 
        />
      )}
    </>
  );
}

export default App;
