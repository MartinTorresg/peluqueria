import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { FaEdit, FaTrash } from 'react-icons/fa';

Modal.setAppElement('#root'); // Ajusta el selector según tu configuración

const ProductosYServicios = () => {
  const [productos, setProductos] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('Producto');
  const [inventario, setInventario] = useState('No');
  const [costo, setCosto] = useState('');
  const [precioVenta, setPrecioVenta] = useState('');
  const [utilidad, setUtilidad] = useState('');
  const [editingProducto, setEditingProducto] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const productos = await window.electron.invoke('get-productos-servicios');
        setProductos(productos);
      } catch (error) {
        console.error('Error fetching productos:', error);
      }
    };

    fetchProductos();
  }, []);

  const handleOpenModal = () => {
    setModalIsOpen(true);
  };

  const handleCloseModal = () => {
    setModalIsOpen(false);
    setNombre('');
    setTipo('Producto');
    setInventario('No');
    setCosto('');
    setPrecioVenta('');
    setUtilidad('');
    setEditingProducto(null);
    setError('');
  };

  const handleAddProducto = async () => {
    try {
      const newProducto = { nombre, tipo, inventario, costo, precioVenta, utilidad: (precioVenta - costo).toFixed(2) };
      const response = await window.electron.invoke('add-producto-servicio', newProducto);
      if (response.success) {
        setProductos([...productos, newProducto]);
        handleCloseModal();
      } else {
        setError(response.error);
      }
    } catch (error) {
      console.error('Error adding producto:', error);
    }
  };

  const handleEditProducto = (producto) => {
    setEditingProducto(producto);
    setNombre(producto.nombre);
    setTipo(producto.tipo);
    setInventario(producto.inventario);
    setCosto(producto.costo);
    setPrecioVenta(producto.precioVenta);
    setUtilidad(producto.utilidad);
    handleOpenModal();
  };

  const handleUpdateProducto = async () => {
    try {
      const updatedProducto = { ...editingProducto, nombre, tipo, inventario, costo, precioVenta, utilidad: (precioVenta - costo).toFixed(2) };
      await window.electron.invoke('update-producto-servicio', updatedProducto);
      setProductos(productos.map((p) => (p.id === updatedProducto.id ? updatedProducto : p)));
      handleCloseModal();
    } catch (error) {
      console.error('Error updating producto:', error);
    }
  };

  const handleDeleteProducto = async (id) => {
    try {
      await window.electron.invoke('delete-producto-servicio', id);
      setProductos(productos.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting producto:', error);
    }
  };

  useEffect(() => {
    if (costo !== '' && precioVenta !== '') {
      setUtilidad((precioVenta - costo).toFixed(2));
    }
  }, [costo, precioVenta]);

  return (
    <div className="container mx-auto mt-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Agregar Productos y Servicios</h1>
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
            <th className="py-2 px-4 border-b">Tipo</th>
            <th className="py-2 px-4 border-b">Inventario</th>
            <th className="py-2 px-4 border-b">Costo</th>
            <th className="py-2 px-4 border-b">Precio Venta</th>
            <th className="py-2 px-4 border-b">Utilidad</th>
            <th className="py-2 px-4 border-b">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td className="py-2 px-4 border-b">{producto.nombre}</td>
              <td className="py-2 px-4 border-b">{producto.tipo}</td>
              <td className="py-2 px-4 border-b">{producto.inventario}</td>
              <td className="py-2 px-4 border-b">{producto.costo}</td>
              <td className="py-2 px-4 border-b">{producto.precioVenta}</td>
              <td className="py-2 px-4 border-b">{producto.utilidad}</td>
              <td className="py-2 px-4 border-b">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditProducto(producto)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteProducto(producto.id)}
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
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Formulario de Producto/Servicio"
        className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-16"
      >
        <h2 className="text-2xl mb-4">{editingProducto ? 'Editar Producto/Servicio' : 'Agregar Producto/Servicio'}</h2>
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
            <label className="block text-gray-700 text-sm font-bold mb-2">Tipo:</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="Producto">Producto</option>
              <option value="Servicio">Servicio</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Inventario:</label>
            <select
              value={inventario}
              onChange={(e) => setInventario(e.target.value)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="Si">Si</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Costo:</label>
            <input
              type="number"
              value={costo}
              onChange={(e) => setCosto(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Precio Venta:</label>
            <input
              type="number"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Utilidad:</label>
            <input
              type="number"
              value={utilidad}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-200"
            />
          </div>
          {error && <div className="text-red-500 mb-4">{error}</div>}
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
              onClick={editingProducto ? handleUpdateProducto : handleAddProducto}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none"
            >
              {editingProducto ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductosYServicios;
