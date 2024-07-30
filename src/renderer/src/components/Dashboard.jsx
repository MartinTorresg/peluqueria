import React, { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [ventas, setVentas] = useState([]);
  const [citas, setCitas] = useState([]);
  const [productosServicios, setProductosServicios] = useState([]);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const ventasData = await window.electron.invoke('get-ventas');
        setVentas(ventasData);
      } catch (error) {
        console.error('Error fetching ventas:', error);
      }
    };

    const fetchCitas = async () => {
      try {
        const citasData = await window.electron.invoke('get-citas');
        setCitas(citasData);
      } catch (error) {
        console.error('Error fetching citas:', error);
      }
    };

    const fetchProductosServicios = async () => {
      try {
        const productosServiciosData = await window.electron.invoke('get-productos-servicios');
        setProductosServicios(productosServiciosData);
      } catch (error) {
        console.error('Error fetching productosServicios:', error);
      }
    };

    fetchVentas();
    fetchCitas();
    fetchProductosServicios();
  }, []);

  const ventasPorMes = ventas.reduce((acc, venta) => {
    const mes = new Date(venta.fecha).getMonth();
    const totalVentas = parseFloat(venta.total) || 0; // Asegurarse de que es un número
    acc[mes] = acc[mes] ? acc[mes] + totalVentas : totalVentas;
    return acc;
  }, {});

  const citasPorMes = citas.reduce((acc, cita) => {
    const mes = new Date(cita.fecha).getMonth();
    acc[mes] = acc[mes] ? acc[mes] + 1 : 1;
    return acc;
  }, {});

  const productosServiciosVendidos = ventas.reduce((acc, venta) => {
    venta.servicios.forEach(servicio => {
      if (acc[servicio.nombre]) {
        acc[servicio.nombre] += servicio.cantidad;
      } else {
        acc[servicio.nombre] = servicio.cantidad;
      }
    });
    return acc;
  }, {});

  const ventasData = Object.keys(ventasPorMes).map(mes => ({
    mes: monthNames[mes],
    ventas: ventasPorMes[mes]
  }));

  const citasData = Object.keys(citasPorMes).map(mes => ({
    mes: monthNames[mes],
    citas: citasPorMes[mes]
  }));

  const productosServiciosData = Object.keys(productosServiciosVendidos).map(nombre => ({
    nombre,
    cantidad: productosServiciosVendidos[nombre]
  }));

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#d0ed57', '#a4de6c', '#d4a4eb', '#a4d9ed', '#a487d8', '#d884d8', '#84d8d8', '#84a4d8'];

  return (
    <div className="dashboard-container">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="chart-container">
        <h2 className="text-xl font-bold mb-4">Ventas por Mes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ventasData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ventas" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h2 className="text-xl font-bold mb-4">Citas por Mes</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={citasData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="citas" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h2 className="text-xl font-bold mb-4">Distribución de Servicios y Productos Vendidos</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={productosServiciosData} dataKey="cantidad" nameKey="nombre" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
              {productosServiciosData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
