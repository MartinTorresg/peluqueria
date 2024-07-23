import React, { useState, useEffect } from 'react';

const ProgramarCita = () => {
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [trabajadorId, setTrabajadorId] = useState('');
  const [selectedServicios, setSelectedServicios] = useState([]);
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');
  const [status, setStatus] = useState('Pendiente');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const clientes = await window.electron.invoke('get-clientes');
        setClientes(clientes);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    const fetchServicios = async () => {
      try {
        const servicios = await window.electron.invoke('get-productos-servicios');
        setServicios(servicios);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };

    fetchClientes();
    fetchServicios();
  }, []);

  const handleAddServicio = (e) => {
    const servicioId = e.target.value;
    if (servicioId && !selectedServicios.includes(servicioId)) {
      setSelectedServicios([...selectedServicios, servicioId]);
    }
  };

  const handleRemoveServicio = (servicioId) => {
    setSelectedServicios(selectedServicios.filter((id) => id !== servicioId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevaCita = {
      clienteId,
      trabajadorId,
      servicios: selectedServicios,
      fecha,
      horaInicio,
      horaFin,
      status,
    };
    console.log('Saving cita:', nuevaCita); // Log para verificar los datos
    await window.electron.invoke('add-cita', nuevaCita);
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Programar Cita</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cliente:</label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Seleccionar Cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Trabajador:</label>
          <input
            type="text"
            value={trabajadorId}
            onChange={(e) => setTrabajadorId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Servicios:</label>
          <select
            onChange={handleAddServicio}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Seleccionar Servicio</option>
            {servicios.filter(s => s.tipo === 'Servicio').map((servicio) => (
              <option key={servicio.id} value={servicio.id}>
                {servicio.nombre}
              </option>
            ))}
          </select>
          <ul className="mt-2">
            {selectedServicios.map((servicioId) => {
              const servicio = servicios.find((s) => s.id === servicioId);
              return (
                <li key={servicioId} className="flex justify-between items-center">
                  {servicio ? servicio.nombre : 'Servicio desconocido'}
                  <button
                    type="button"
                    onClick={() => handleRemoveServicio(servicioId)}
                    className="text-red-500 hover:text-red-700"
                  >
                    x
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fecha:</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hora de Inicio:</label>
          <input
            type="time"
            value={horaInicio}
            onChange={(e) => setHoraInicio(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hora de Fin:</label>
          <input
            type="time"
            value={horaFin}
            onChange={(e) => setHoraFin(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Estado de la Cita:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Confirmada">Confirmada</option>
            <option value="Cancelada">Cancelada</option>
            <option value="Completada">Completada</option>
            <option value="No Asistió">No Asistió</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Programar Cita
        </button>
      </form>
    </div>
  );
};

export default ProgramarCita;
