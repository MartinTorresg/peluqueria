import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Ajusta el selector según tu configuración

const RegistrarVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productosServicios, setProductosServicios] = useState([]);
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVenta, setNewVenta] = useState({
    fecha: '',
    forma: 'Contado',
    metodoPago: 'Efectivo',
    clienteId: '',
    servicios: [],
    subTotal: 0,
    descuento: 0,
    total: 0,
    usuario: 'usuario@example.com', // Ajusta según el usuario actual
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ventasData, clientesData, productosServiciosData] = await Promise.all([
          window.electron.invoke('get-ventas'),
          window.electron.invoke('get-clientes'),
          window.electron.invoke('get-productos-servicios'),
        ]);
        setVentas(ventasData);
        setClientes(clientesData);
        setProductosServicios(productosServiciosData.filter(item => item.tipo === 'Servicio' || item.tipo === 'Producto'));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSelectVenta = (venta) => setSelectedVenta(venta);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewVenta((prevVenta) => ({
      ...prevVenta,
      [name]: value,
    }));
  };

  const handleServicioChange = (e) => {
    const servicioId = e.target.value;
    const servicio = productosServicios.find((s) => s.id === servicioId);
    if (servicio) {
      setNewVenta((prevVenta) => {
        const serviciosActuales = [...prevVenta.servicios, { ...servicio, cantidad: 1 }];
        const subTotal = serviciosActuales.reduce((total, item) => total + item.precioVenta * item.cantidad, 0);
        const total = subTotal - prevVenta.descuento;
        return { ...prevVenta, servicios: serviciosActuales, subTotal, total };
      });
    }
  };

  const handleRemoveServicio = (servicioId) => {
    setNewVenta((prevVenta) => {
      const serviciosActuales = prevVenta.servicios.filter((item) => item.id !== servicioId);
      const subTotal = serviciosActuales.reduce((total, item) => total + item.precioVenta * item.cantidad, 0);
      const total = subTotal - prevVenta.descuento;
      return { ...prevVenta, servicios: serviciosActuales, subTotal, total };
    });
  };

  const handleDescuentoChange = (e) => {
    const descuento = parseFloat(e.target.value);
    setNewVenta((prevVenta) => {
      const total = prevVenta.subTotal - descuento;
      return { ...prevVenta, descuento, total };
    });
  };

  const handleAddVenta = async (e) => {
    e.preventDefault();
    try {
      await window.electron.invoke('add-venta', newVenta);
      setVentas([...ventas, newVenta]);
      handleCloseModal();
    } catch (error) {
      console.error('Error adding venta:', error);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Registrar Ventas</h1>
      <button
        onClick={handleOpenModal}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        + Add
      </button>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">FECHA</th>
            <th className="border px-4 py-2">FORMA</th>
            <th className="border px-4 py-2">METODO DE PAGO</th>
            <th className="border px-4 py-2">USUARIO</th>
            <th className="border px-4 py-2">CLIENTE</th>
            <th className="border px-4 py-2">SUB TOTAL</th>
            <th className="border px-4 py-2">DESCUENTO</th>
            <th className="border px-4 py-2">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.id} onClick={() => handleSelectVenta(venta)}>
              <td className="border px-4 py-2">{venta.fecha}</td>
              <td className="border px-4 py-2">{venta.forma}</td>
              <td className="border px-4 py-2">{venta.metodoPago}</td>
              <td className="border px-4 py-2">{venta.usuario}</td>
              <td className="border px-4 py-2">{clientes.find(c => c.id === venta.clienteId)?.nombre || 'Cliente desconocido'}</td>
              <td className="border px-4 py-2">{venta.subTotal}</td>
              <td className="border px-4 py-2">{venta.descuento}</td>
              <td className="border px-4 py-2">{venta.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedVenta && (
        <Modal
          isOpen={!!selectedVenta}
          onRequestClose={() => setSelectedVenta(null)}
          contentLabel="Detalles de la Venta"
          className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-16"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <h2 className="text-2xl mb-4">Detalles de la Venta</h2>
          <p><strong>Fecha:</strong> {selectedVenta.fecha}</p>
          <p><strong>Forma:</strong> {selectedVenta.forma}</p>
          <p><strong>Método de Pago:</strong> {selectedVenta.metodoPago}</p>
          <p><strong>Usuario:</strong> {selectedVenta.usuario}</p>
          <p><strong>Cliente:</strong> {clientes.find(c => c.id === selectedVenta.clienteId)?.nombre || 'Cliente desconocido'}</p>
          <p><strong>Sub Total:</strong> {selectedVenta.subTotal}</p>
          <p><strong>Descuento:</strong> {selectedVenta.descuento}</p>
          <p><strong>Total:</strong> {selectedVenta.total}</p>
          <h3 className="text-xl mt-4">Detalle de la Venta</h3>
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="border px-4 py-2">PRECIO</th>
                <th className="border px-4 py-2">PRODUCTO</th>
                <th className="border px-4 py-2">CANTIDAD</th>
                <th className="border px-4 py-2">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {selectedVenta.servicios.map((servicio, index) => (
                <tr key={index}>
                  <td className="border px-4 py-2">{servicio.precioVenta}</td>
                  <td className="border px-4 py-2">{servicio.nombre}</td>
                  <td className="border px-4 py-2">{servicio.cantidad}</td>
                  <td className="border px-4 py-2">{servicio.precioVenta * servicio.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={() => setSelectedVenta(null)}
            className="bg-gray-500 text-white px-4 py-2 rounded mt-4 hover:bg-gray-700 focus:outline-none"
          >
            Cerrar
          </button>
        </Modal>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={handleCloseModal}
        contentLabel="Ventas Form"
        className="bg-white p-6 rounded shadow-lg max-w-lg mx-auto mt-16"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      >
        <h2 className="text-2xl mb-4">Ventas Form</h2>
        <form onSubmit={handleAddVenta} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <input
              type="date"
              name="fecha"
              value={newVenta.fecha}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Forma</label>
            <div className="mt-1 flex space-x-4">
              <button
                type="button"
                className={`px-4 py-2 rounded ${newVenta.forma === 'Contado' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setNewVenta((prevVenta) => ({ ...prevVenta, forma: 'Contado' }))}
              >
                Contado
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded ${newVenta.forma === 'Crédito' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setNewVenta((prevVenta) => ({ ...prevVenta, forma: 'Crédito' }))}
              >
                Crédito
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
            <div className="mt-1 flex space-x-4">
              <button
                type="button"
                className={`px-4 py-2 rounded ${newVenta.metodoPago === 'Efectivo' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setNewVenta((prevVenta) => ({ ...prevVenta, metodoPago: 'Efectivo' }))}
              >
                Efectivo
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded ${newVenta.metodoPago === 'Tarjeta' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setNewVenta((prevVenta) => ({ ...prevVenta, metodoPago: 'Tarjeta' }))}
              >
                Tarjeta
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded ${newVenta.metodoPago === 'Transferencia' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                onClick={() => setNewVenta((prevVenta) => ({ ...prevVenta, metodoPago: 'Transferencia' }))}
              >
                Transferencia
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Cliente</label>
            <select
              name="clienteId"
              value={newVenta.clienteId}
              onChange={handleInputChange}
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
            <label className="block text-sm font-medium text-gray-700">Servicios</label>
            <select
              onChange={handleServicioChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar Servicio</option>
              {productosServicios.filter(item => item.tipo === 'Servicio').map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.nombre}
                </option>
              ))}
            </select>
            <ul className="mt-2">
              {newVenta.servicios.filter(item => item.tipo === 'Servicio').map((servicio) => (
                <li key={servicio.id} className="flex justify-between items-center">
                  {servicio.nombre} - {servicio.cantidad}
                  <button
                    type="button"
                    onClick={() => handleRemoveServicio(servicio.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Productos</label>
            <select
              onChange={handleServicioChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Seleccionar Producto</option>
              {productosServicios.filter(item => item.tipo === 'Producto').map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre}
                </option>
              ))}
            </select>
            <ul className="mt-2">
              {newVenta.servicios.filter(item => item.tipo === 'Producto').map((producto) => (
                <li key={producto.id} className="flex justify-between items-center">
                  {producto.nombre} - {producto.cantidad}
                  <button
                    type="button"
                    onClick={() => handleRemoveServicio(producto.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sub Total</label>
            <input
              type="number"
              name="subTotal"
              value={newVenta.subTotal}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descuento</label>
            <input
              type="number"
              name="descuento"
              value={newVenta.descuento}
              onChange={handleDescuentoChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Total</label>
            <input
              type="number"
              name="total"
              value={newVenta.total}
              readOnly
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Guardar Venta
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default RegistrarVentas;
