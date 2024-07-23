import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-modal';

const localizer = momentLocalizer(moment);

const AgendaCitas = () => {
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [citasData, clientesData, serviciosData] = await Promise.all([
          window.electron.invoke('get-citas'),
          window.electron.invoke('get-clientes'),
          window.electron.invoke('get-productos-servicios')
        ]);

        setClientes(clientesData);
        setServicios(serviciosData);

        const eventos = citasData.map((cita) => {
          const cliente = clientesData.find(c => c.id === cita.clienteId) || { nombre: 'Cliente desconocido' };
          const serviciosAgendados = Array.isArray(cita.servicios) ? cita.servicios.map(servicioId => {
            const servicio = serviciosData.find(s => s.id === servicioId);
            return servicio ? servicio.nombre : 'Servicio desconocido';
          }).join(', ') : 'Sin servicios';

          return {
            id: cita.id,
            title: cliente.nombre,
            start: new Date(`${cita.fecha}T${cita.horaInicio}`),
            end: new Date(`${cita.fecha}T${cita.horaFin}`),
            cliente,
            servicios: serviciosAgendados,
            status: cita.status,
          };
        });

        setCitas(eventos);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
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
        style={{ height: 500, backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: '#3182CE', // Color de fondo del evento
            borderRadius: '5px',
            color: 'white',
            border: 'none',
            display: 'block',
          }
        })}
        dayPropGetter={() => ({
          style: {
            backgroundColor: '#f5f5f5', // Color de fondo de los días
          }
        })}
        selectable
        onSelectEvent={handleSelectEvent}
      />
      {selectedEvent && (
        <Modal
          isOpen={!!selectedEvent}
          onRequestClose={handleCloseModal}
          contentLabel="Detalles de la Cita"
          className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-16"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          <h2 className="text-2xl mb-4">Detalles de la Cita</h2>
          <p><strong>Fecha Cita:</strong> {moment(selectedEvent.start).format('DD/MM/YYYY')}</p>
          <p><strong>Hora Inicio:</strong> {moment(selectedEvent.start).format('HH:mm:ss')}</p>
          <p><strong>Hora Término:</strong> {moment(selectedEvent.end).format('HH:mm:ss')}</p>
          <p><strong>Servicios Agendados:</strong> {selectedEvent.servicios}</p>
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
