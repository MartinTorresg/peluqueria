import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('(+569)');
  const [email, setEmail] = useState('');
  const [editingCliente, setEditingCliente] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        console.log('Invoking get-clientes');
        const clientes = await window.electron.invoke('get-clientes');
        console.log('Clientes fetched:', clientes);
        setClientes(clientes);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };

    fetchClientes();
  }, []);

  const handleAddCliente = async () => {
    try {
      const newCliente = { nombre, telefono, email };
      console.log('Adding cliente:', newCliente);
      const response = await window.electron.invoke('add-cliente', newCliente);
      console.log('Add cliente response:', response);
      if (response.success) {
        setClientes([...clientes, newCliente]);
        setNombre('');
        setTelefono('(+569)');
        setEmail('');
        setEditingCliente(null);
        setError('');
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const handleEditCliente = (cliente) => {
    console.log('Editing cliente:', cliente);
    setEditingCliente(cliente);
    setNombre(cliente.nombre);
    setTelefono(cliente.telefono);
    setEmail(cliente.email);
  };

  const handleUpdateCliente = async () => {
    try {
      const updatedCliente = { ...editingCliente, nombre, telefono, email };
      console.log('Updating cliente:', updatedCliente);
      const response = await window.electron.invoke('update-cliente', updatedCliente);
      console.log('Update cliente response:', response);
      setClientes(clientes.map((c) => (c.id === updatedCliente.id ? updatedCliente : c)));
      setNombre('');
      setTelefono('(+569)');
      setEmail('');
      setEditingCliente(null);
      setError('');
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleDeleteCliente = async (id) => {
    try {
      console.log('Deleting cliente with id:', id);
      const response = await window.electron.invoke('delete-cliente', id);
      console.log('Delete cliente response:', response);
      setClientes(clientes.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold">Clientes</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <input
          type="text"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        {editingCliente ? (
          <button
            onClick={handleUpdateCliente}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none mr-2"
          >
            Actualizar Cliente
          </button>
        ) : (
          <button
            onClick={handleAddCliente}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none"
          >
            Agregar Cliente
          </button>
        )}
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
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
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Clientes;
