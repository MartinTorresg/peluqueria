import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaEdit, FaTrash, FaPhone, FaComment } from 'react-icons/fa';

Modal.setAppElement('#root'); // Ajusta el selector según tu configuración

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [editingCliente, setEditingCliente] = useState(null);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const clientes = await window.electron.invoke('get-clientes');
        setClientes(clientes);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClientes();
  }, []);

  const handleOpenModal = () => {
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setNombre('');
    setTelefono('');
    setEmail('');
    setEditingCliente(null);
  };

  const handleAddCliente = async () => {
    try {
      const newCliente = { nombre, telefono, email };
      await window.electron.invoke('add-cliente', newCliente);
      setClientes([...clientes, newCliente]);
      handleCloseModal();
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleEditCliente = (cliente) => {
    setEditingCliente(cliente);
    setNombre(cliente.nombre);
    setTelefono(cliente.telefono);
    setEmail(cliente.email);
    handleOpenModal();
  };

  const handleUpdateCliente = async () => {
    try {
      const updatedCliente = { ...editingCliente, nombre, telefono, email };
      await window.electron.invoke('update-cliente', updatedCliente);
      setClientes(clientes.map((c) => (c.id === updatedCliente.id ? updatedCliente : c)));
      handleCloseModal();
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDeleteCliente = async (id) => {
    try {
      await window.electron.invoke('delete-cliente', id);
      setClientes(clientes.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button
          onClick={handleOpenModal}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none"
        >
          + Add
        </button>
      </div>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Nombre</th>
            <th className="py-2 px-4 border-b">Teléfono</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td className="py-2 px-4 border-b">{cliente.nombre}</td>
              <td className="py-2 px-4 border-b">{cliente.telefono}</td>
              <td className="py-2 px-4 border-b">{cliente.email}</td>
              <td className="py-2 px-4 border-b">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditCliente(cliente)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteCliente(cliente.id)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <FaTrash />
                  </button>
                  <button
                    onClick={() => window.open(`tel:${cliente.telefono}`)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <FaPhone />
                  </button>
                  <button
                    onClick={() => window.open(`sms:${cliente.telefono}`)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <FaComment />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Formulario de Cliente"
        className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-16"
      >
        <h2 className="text-2xl mb-4">{editingCliente ? 'Editar Cliente' : 'Agregar Cliente'}</h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Teléfono:</label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCloseModal}
              className="bg-gray-500 text-white px-4 py-2 rounded mr-2 hover:bg-gray-700 focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={editingCliente ? handleUpdateCliente : handleAddCliente}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none"
            >
              {editingCliente ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clientes;
