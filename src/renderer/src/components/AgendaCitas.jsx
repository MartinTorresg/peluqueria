import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-modal';

const localizer = momentLocalizer(moment);

const AgendaCitas = () => {
  const [citas, setCitas] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const citas = await window.electron.invoke('get-citas');
        const eventos = citas.map((cita) => ({
          id: cita.id,
          title: cita.cliente.nombre,
          start: new Date(`${cita.fecha}T${cita.horaInicio}`),
          end: new Date(`${cita.fecha}T${cita.horaFin}`),
          cliente: cita.cliente,
          servicios: cita.servicios,
          status: cita.status,
        }));
        setCitas(eventos);
      } catch (error) {
        console.error('Error fetching citas:', error);
      }
    };

    fetchCitas();
  }, []);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Agenda de Citas</h1>
      <Calendar
        localizer={localizer}
        events={citas}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectEvent={handleSelectEvent}
      />
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onRequestClose={handleCloseModal}
          contentLabel="Detalles de la Cita"
          className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-16"
        >
          <h2 className="text-2xl mb-4">Detalles de la Cita</h2>
          <p><strong>Fecha Cita:</strong> {moment(selectedEvent.start).format('DD/MM/YYYY')}</p>
          <p><strong>Hora Inicio:</strong> {moment(selectedEvent.start).format('HH:mm:ss')}</p>
          <p><strong>Hora Término:</strong> {moment(selectedEvent.end).format('HH:mm:ss')}</p>
          <p><strong>Servicios Agendados:</strong> {selectedEvent.servicios.map(s => s.nombre).join(', ')}</p>
          <p><strong>Cliente:</strong> {selectedEvent.cliente.nombre}</p>
          <p><strong>Status Cita:</strong> {selectedEvent.status}</p>
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

export default AgendaCitas;
