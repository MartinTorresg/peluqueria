import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

const RegistrarInventario = () => {
  const [productos, setProductos] = useState([]);
  const [selectedProductoId, setSelectedProductoId] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const productosData = await window.electron.invoke('get-productos-inventario');
        setProductos(productosData);
      } catch (error) {
        console.error('Error fetching productos:', error);
      }
    };

    fetchProductos();
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!selectedProductoId || cantidad <= 0) return;
    try {
      await window.electron.invoke('update-producto-inventario', {
        id: selectedProductoId,
        cantidad: parseInt(cantidad),
      });
      // Actualizar el estado local
      setProductos(productos.map(producto => {
        if (producto.id === selectedProductoId) {
          return { ...producto, stock: (parseInt(producto.stock) || 0) + parseInt(cantidad) };
        }
        return producto;
      }));
      handleCloseModal();
    } catch (error) {
      console.error('Error updating inventario:', error);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Registrar Inventario</h1>
      <button
        onClick={handleOpenModal}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        + Add
      </button>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">NOMBRE</th>
            <th className="border px-4 py-2">TIPO</th>
            <th className="border px-4 py-2">STOCK</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.id}>
              <td className="border px-4 py-2">{producto.nombre}</td>
              <td className="border px-4 py-2">{producto.tipo}</td>
              <td className="border px-4 py-2">{producto.stock || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Agregar Stock"
        className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-16"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      >
        <h2 className="text-2xl mb-4">Agregar Stock</h2>
        <form onSubmit={handleAddStock} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Producto</label>
            <select
              value={selectedProductoId}
              onChange={(e) => setSelectedProductoId(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar Producto</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cantidad</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Agregar
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default RegistrarInventario;
