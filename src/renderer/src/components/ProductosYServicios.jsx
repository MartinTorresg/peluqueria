import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ProductosYServicios = () => {
  const [productos, setProductos] = useState([]);
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

  const handleAddProducto = async () => {
    try {
      const newProducto = { nombre, tipo, inventario, costo, precioVenta, utilidad: (precioVenta - costo).toFixed(2) };
      const response = await window.electron.invoke('add-producto-servicio', newProducto);
      if (response.success) {
        setProductos([...productos, newProducto]);
        resetForm();
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
  };

  const handleUpdateProducto = async () => {
    try {
      const updatedProducto = { ...editingProducto, nombre, tipo, inventario, costo, precioVenta, utilidad: (precioVenta - costo).toFixed(2) };
      await window.electron.invoke('update-producto-servicio', updatedProducto);
      setProductos(productos.map((p) => (p.id === updatedProducto.id ? updatedProducto : p)));
      resetForm();
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

  const resetForm = () => {
    setNombre('');
    setTipo('Producto');
    setInventario('No');
    setCosto('');
    setPrecioVenta('');
    setUtilidad('');
    setEditingProducto(null);
    setError('');
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
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
        >
          <option value="Producto">Producto</option>
          <option value="Servicio">Servicio</option>
        </select>
        <select
          value={inventario}
          onChange={(e) => setInventario(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-2"
        >
          <option value="Si">Si</option>
          <option value="No">No</option>
        </select>
        <input
          type="number"
          placeholder="Costo"
          value={costo}
          onChange={(e) => setCosto(parseFloat(e.target.value))}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <input
          type="number"
          placeholder="Precio Venta"
          value={precioVenta}
          onChange={(e) => setPrecioVenta(parseFloat(e.target.value))}
          className="w-full px-3 py-2 border rounded mb-2"
        />
        <input
          type="number"
          placeholder="Utilidad"
          value={utilidad}
          readOnly
          className="w-full px-3 py-2 border rounded mb-2 bg-gray-200"
        />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={resetForm}
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
    </div>
  );
};

export default ProductosYServicios;
