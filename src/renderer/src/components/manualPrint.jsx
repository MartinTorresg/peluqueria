import { useState } from 'react'

const ManualPrint = ({ isOpen, handleClose, handleSelectProduct }) => {
  const [productName, setProductName] = useState()
  const [productBarcode, setProductBarcode] = useState()
  const [productPrice, setProductPrice] = useState()
  if (!isOpen) return null

  // const format = {
  //   id,barcode,name,price
  // }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={handleClose}
    >
      <div
        className="bg-white p-4 rounded-lg shadow-lg max-w-sm w-full"
        onClick={(e) => e.stopPropagation()} // Prevent click from closing the modal
      >
        <div className="flex flex-row justify-between">
          <div className="text-black font-semibold text-lg">Ingrese los datos del producto</div>
          <button onClick={handleClose} className="text-gray-600 hover:text-gray-900">
            &times;
          </button>
        </div>

        <div className="mt-2 space-y-4">
          <input
            type="text"
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Ingresa el nombre"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            maxLength="40"
          />
          <input
            type="text"
            onChange={(e) => setProductBarcode(e.target.value)}
            placeholder="Ingresa el codigo de barras"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            pattern="\d*"
            maxLength="20"
          />
          <input
              type="text"
              onChange={(e) => setProductPrice(e.target.value)}
              placeholder="Ingresa el precio"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                  }
              }}
              maxLength="10"
          />

        </div>
        <div className="flex justify-end mt-2">
          <button
            onClick={() => {
              handleSelectProduct({
                id: Math.floor(Math.random() * 9000000000) + 1000000000,
                barcode: productBarcode,
                name: productName,
                price: productPrice
              })
              handleClose()
            }}
            className=" p-2 rounded bg-blue-700 font-bold"
          >
            Ingresar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ManualPrint
