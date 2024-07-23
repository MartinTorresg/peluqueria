import React, { useState } from 'react';

const ProgramarCita = () => {
  const [clienteId, setClienteId] = useState('');
  const [trabajadorId, setTrabajadorId] = useState('');
  const [servicioId, setServicioId] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para programar una cita
    console.log({
      clienteId,
      trabajadorId,
      servicioId,
      fecha,
      hora,
    });
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Programar Cita</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Cliente:</label>
          <input
            type="text"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
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
          <label className="block text-sm font-medium text-gray-700">Servicio:</label>
          <input
            type="text"
            value={servicioId}
            onChange={(e) => setServicioId(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
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
          <label className="block text-sm font-medium text-gray-700">Hora:</label>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
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
