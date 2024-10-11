# **Sistema de Gestión de Peluquería**

Este proyecto es un sistema de gestión para peluquerías que permite administrar citas, clientes, productos, servicios, ventas e inventario de forma eficiente. La aplicación fue desarrollada usando **Electron**, **React** y **TailwindCSS** para crear una aplicación de escritorio sencilla y funcional.

## **Tabla de Contenidos**
1. [Descripción del Proyecto](#descripción-del-proyecto)
2. [Características Principales](#características-principales)
3. [Tecnologías Usadas](#tecnologías-usadas)
4. [Requisitos del Sistema](#requisitos-del-sistema)
5. [Instalación y Ejecución](#instalación-y-ejecución)
6. [Uso del Sistema](#uso-del-sistema)
7. [Estructura de Datos](#estructura-de-datos)
8. [Desafíos y Soluciones](#desafíos-y-soluciones)

---

## **Descripción del Proyecto**
Este sistema fue diseñado para facilitar las operaciones diarias de una peluquería, desde la gestión de citas y clientes, hasta el control de productos y ventas. El objetivo principal es proporcionar una solución simple pero eficaz que permita al personal gestionar todos los aspectos clave de la peluquería sin complicaciones.

## **Características Principales**
- **AgendaCitas:** Visualiza las citas programadas en un calendario interactivo.
- **ProgramarCita:** Permite añadir nuevas citas de clientes al sistema.
- **Clientes:** Gestión de la información personal y el historial de citas de los clientes.
- **ProductosYServicios:** Gestión de productos y servicios ofrecidos por la peluquería.
- **RegistrarVentas:** Permite registrar ventas de productos o servicios.
- **RegistrarInventario:** Gestiona el inventario de productos en tiempo real.
- **CitadosAhora:** Muestra una lista de clientes que tienen citas activas en el momento actual.
- **Dashboard:** Proporciona estadísticas clave sobre citas, ventas y productos.

## **Tecnologías Usadas**
- **Electron:** Para crear la aplicación de escritorio.
- **React:** Para el desarrollo de la interfaz de usuario.
- **TailwindCSS:** Para el diseño y la estilización de la aplicación.
- **Node.js:** Backend y manejo de lógica del sistema.
- **Archivos CSV:** Almacenamiento de datos, incluyendo citas, clientes, productos y ventas.

## **Requisitos del Sistema**
Para ejecutar esta aplicación, necesitarás:
- **Node.js** (versión 14 o superior)
- **npm** (versión 6 o superior)
- **Electron** (versión 11 o superior)

## **Instalación y Ejecución**

### **Project Setup**
1. Clona este repositorio:

   ```bash
   git clone https://github.com/tuusuario/sistema-peluqueria.git

2. Navega a la carpeta del proyecto:

   ```bash
   cd sistema-peluqueria


3. Instala las dependencias necesarias:

   ```bash
   npm install
   ```

### **Development**
Para iniciar el entorno de desarrollo, ejecuta el siguiente comando:

```bash
npm run dev
```

### **Build**
Para generar un build de la aplicación en diferentes sistemas operativos, puedes utilizar los siguientes comandos:

#### Windows:
```bash
npm run build:win
```

#### macOS:
```bash
npm run build:mac
```

#### Linux:
```bash
npm run build:linux
```

## **Uso del Sistema**
1. **Inicio del Sistema:** Al ejecutar la aplicación, serás recibido con un **Dashboard** donde podrás ver las estadísticas generales de la peluquería, incluyendo ventas, citas programadas y estado de productos.

2. **Agenda de Citas:** Ve a la pestaña **AgendaCitas** para visualizar y gestionar las citas. Aquí puedes añadir nuevas citas, modificar o eliminar las existentes.

3. **Gestión de Clientes:** En la sección de **Clientes**, puedes añadir, editar o eliminar clientes del sistema. También podrás consultar el historial de citas de cada cliente.

4. **Inventario y Ventas:** Usa las pestañas **ProductosYServicios** y **RegistrarInventario** para gestionar el inventario, y **RegistrarVentas** para registrar ventas de productos y servicios.

## **Estructura de Datos**
Los datos del sistema se almacenan en varios archivos CSV:

- **clientes.csv:** Contiene la información de los clientes.
- **citas.csv:** Almacena las citas programadas.
- **productos_servicios.csv:** Incluye los productos y servicios ofrecidos por la peluquería.
- **ventas.csv:** Registra las ventas de productos y servicios.

## **Desafíos y Soluciones**
- **Comunicación IPC:** Asegurar la correcta comunicación entre el proceso principal de Electron y los componentes de React fue uno de los principales desafíos. Implementamos un sistema eficiente de **Inter-Process Communication (IPC)** para resolver este problema.
  
- **Gestión de Inventario:** Desarrollamos lógica personalizada para manejar el inventario en tiempo real, permitiendo agregar, editar y visualizar los productos de manera sencilla.

- **Interfaz de Usuario:** Diseñamos una interfaz intuitiva y amigable para el usuario, con el objetivo de hacer que el personal de la peluquería, sin necesidad de conocimientos técnicos, pueda operar el sistema sin complicaciones.
