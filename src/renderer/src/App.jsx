import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ProgramarCita from './components/ProgramarCita';
import Productos from './components/ProductosYServicios';
import Clientes from './components/Clientes'; // Importa el componente Clientes
import AgendaCitas from './components/AgendaCitas';
import RegistrarVentas from './components/RegistrarVentas';
import RegistrarInventario from './components/RegistrarInventario';
import './App.css';

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <Link to="/" className="hover:bg-gray-700 p-2 rounded">Agenda de citas</Link>
            <Link to="/programar-citas" className="hover:bg-gray-700 p-2 rounded">Programar citas</Link>
            <Link to="/registrar-venta" className="hover:bg-gray-700 p-2 rounded">Registrar Venta</Link>
            <Link to="/citados-ahora" className="hover:bg-gray-700 p-2 rounded">Citados Ahora</Link>
            <Link to="/confirmar-citas" className="hover:bg-gray-700 p-2 rounded">Confirmar Citas</Link>
            <Link to="/clientes" className="hover:bg-gray-700 p-2 rounded">Clientes</Link>
            <Link to="/productos-y-servicios" className="hover:bg-gray-700 p-2 rounded">Agregar Productos y Servicios</Link>
            <Link to="/registrar-inventario" className="hover:bg-gray-700 p-2 rounded">Registrar Inventario</Link>
            <Link to="/existencias" className="hover:bg-gray-700 p-2 rounded">Existencias</Link>
          </div>
        </header>
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/programar-citas" element={<ProgramarCita />} />
            <Route path="/productos-y-servicios" element={<Productos />} />
            <Route path="/clientes" element={<Clientes />} /> {/* Agrega la ruta para Clientes */}
            <Route path="/" element={<AgendaCitas />} />
            <Route path="/registrar-venta" element={<RegistrarVentas />} />
            <Route path="/registrar-inventario" element={<RegistrarInventario />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
