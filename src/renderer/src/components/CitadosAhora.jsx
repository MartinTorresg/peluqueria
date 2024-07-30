import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Ajusta el selector según tu configuración

const CitadosAhora = () => {
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selectedCita, setSelectedCita] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const [citasData, clientesData] = await Promise.all([
          window.electron.invoke('get-citas'),
          window.electron.invoke('get-clientes')
        ]);

        const today = new Date().toLocaleString('en-CA', { timeZone: 'America/Santiago', year: 'numeric', month: '2-digit', day: '2-digit' }).split(' ')[0];

        const citasHoy = citasData.filter(cita => cita.fecha === today);

        setCitas(citasHoy);
        setClientes(clientesData);
        console.log('Citas de hoy:', citasHoy);
        console.log('Clientes:', clientesData);
      } catch (error) {
        console.error('Error fetching citas or clientes:', error);
      }
    };
    fetchCitas();
  }, []);

  const handleOpenModal = (cita) => {
    setSelectedCita(cita);
    setIsModalOpen(true);
    console.log('Cita seleccionada:', cita);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCita(null);
  };

  const handleStatusChange = async (status) => {
    if (selectedCita) {
      const updatedCita = { ...selectedCita, status };
      try {
        const response = await window.electron.invoke('update-cita', updatedCita);
        if (response.success) {
          setCitas((prevCitas) =>
            prevCitas.map((cita) => (cita.id === updatedCita.id ? updatedCita : cita))
          );
          console.log('Cita actualizada:', updatedCita);
          setSelectedCita(updatedCita);
        } else {
          console.error('Error updating cita');
        }
      } catch (error) {
        console.error('Error updating cita:', error);
      }
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Citados Ahora</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">FECHA CITA</th>
            <th className="border px-4 py-2">HORA INICIO</th>
            <th className="border px-4 py-2">HORA TERMINO</th>
            <th className="border px-4 py-2">SERVICIOS AGENDADOS</th>
            <th className="border px-4 py-2">CLIENTE</th>
            <th className="border px-4 py-2">STATUS CITA</th>
          </tr>
        </thead>
        <tbody>
          {citas.map((cita) => (
            <tr key={cita.id} onClick={() => handleOpenModal(cita)}>
              <td className="border px-4 py-2">{cita.fecha}</td>
              <td className="border px-4 py-2">{cita.horaInicio}</td>
              <td className="border px-4 py-2">{cita.horaFin}</td>
              <td className="border px-4 py-2">{cita.servicios.map(servicio => servicio.nombre).join(', ')}</td>
              <td className="border px-4 py-2">{clientes.find(c => c.id === cita.clienteId)?.nombre || 'Cliente desconocido'}</td>
              <td className="border px-4 py-2">{cita.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedCita && (
        <Modal
          isOpen={isModalOpen}
          onRequestClose={handleCloseModal}
          contentLabel="Detalles de la Cita"
          className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-16"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <h2 className="text-2xl mb-4">Detalles de la Cita</h2>
          <p><strong>Fecha Cita:</strong> {selectedCita.fecha}</p>
          <p><strong>Hora Inicio:</strong> {selectedCita.horaInicio}</p>
          <p><strong>Hora Término:</strong> {selectedCita.horaFin}</p>
          <p><strong>Servicios Agendados:</strong> {selectedCita.servicios.map(servicio => servicio.nombre).join(', ')}</p>
          <p><strong>Cliente:</strong> {clientes.find(c => c.id === selectedCita.clienteId)?.nombre || 'Cliente desconocido'}</p>
          <p><strong>Status Cita:</strong> {selectedCita.status}</p>
          <h3 className="text-xl mt-4">Acciones</h3>
          <div className="flex space-x-4">
            <button
              onClick={() => handleStatusChange('Cancelada')}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleStatusChange('Reprogramada')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reprogramar
            </button>
            <button
              onClick={() => handleStatusChange('No Asistió')}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              No Asistió
            </button>
          </div>
          <button
            onClick={handleCloseModal}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-4 hover:bg-gray-700 focus:outline-none"
          >
            Cerrar
          </button>
        </Modal>
      )}
    </div>
  );
};

export default CitadosAhora;
