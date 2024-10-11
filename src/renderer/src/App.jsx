import React, { useState } from 'react';
import Clientes from './components/Clientes';
import ProgramarCita from './components/ProgramarCita';
import Productos from './components/ProductosYServicios';
import AgendaCitas from './components/AgendaCitas';
import RegistrarVentas from './components/RegistrarVentas';
import RegistrarInventario from './components/RegistrarInventario';
import CitadosAhora from './components/CitadosAhora';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  console.log('App component mounted');

  const [currentComponent, setCurrentComponent] = useState(<AgendaCitas />);

  const renderComponent = (component) => {
    setCurrentComponent(component);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <button className="hover:bg-gray-700 p-2 rounded" onClick={() => renderComponent(<AgendaCitas />)}>Agenda de citas</button>
          <button className="hover:bg-gray-700 p-2 rounded" onClick={() => renderComponent(<ProgramarCita />)}>Programar citas</button>
          <button className="hover:bg-gray-700 p-2 rounded" onClick={() => renderComponent(<RegistrarVentas />)}>Registrar Venta</button>
          <button className="hover:bg-gray-700 p-2 rounded" onClick={() => renderComponent(<CitadosAhora />)}>Citados Ahora</button>
          <button className="hover:bg-gray-700 p-2 rounded" onClick={() => renderComponent(<Clientes />)}>Clientes</button>
          <button className="hover:bg-gray-700 p-2 rounded" onClick={() => renderComponent(<Productos />)}>Agregar Productos y Servicios</button>
          <button className="hover:bg-gray-700 p-2 rounded" onClick={() => renderComponent(<RegistrarInventario />)}>Registrar Inventario</button>
          <button className="hover:bg-gray-700 p-2 rounded" onClick={() => renderComponent(<Dashboard />)}>Dashboard</button>
        </div>
      </header>
      <main id="main-content" className="flex-grow p-4">
        {currentComponent}
      </main>
    </div>
  );
}

export default App;
